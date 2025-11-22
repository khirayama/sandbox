# 認証機能ドキュメント

## 概要

LightList は Firebase Authentication を使用したメール/パスワード認証システムを実装しています。

## アーキテクチャ

### ディレクトリ構成

```
src/
├── components/
│   ├── FormInput.tsx          - フォーム入力欄コンポーネント
│   ├── ErrorMessage.tsx       - エラーメッセージ表示コンポーネント
│   └── SuccessMessage.tsx     - 成功メッセージ表示コンポーネント
├── lib/
│   ├── mutations/
│   │   └── auth.ts            - 認証関連のFirestore操作
│   └── utils/
│       ├── validation.ts      - フォームバリデーション関数
│       └── errors.ts          - エラーメッセージハンドリング関数
└── pages/
    ├── index.tsx              - サインイン/サインアップ/パスワードリセット依頼ページ
    └── password_reset.tsx     - パスワードリセット実行ページ
```

### 共通コンポーネント

#### FormInput

フォーム入力欄を統一されたスタイルで表示します。

**プロップス:**

- `id`: HTML id属性
- `label`: 入力欄のラベル
- `type`: input要素のtype属性（text, password, email など）
- `value`: 現在の入力値
- `onChange`: 入力値変更時のコールバック関数
- `error`: エラーメッセージ（表示時のみ）
- `disabled`: 入力欄の無効化フラグ
- `placeholder`: プレースホルダーテキスト

#### ErrorMessage

エラーメッセージを赤色で表示します。

**プロップス:**

- `message`: 表示するエラーメッセージ

#### SuccessMessage

成功メッセージを緑色で表示します。

**プロップス:**

- `message`: 表示する成功メッセージ

### ユーティリティ関数

#### lib/utils/validation.ts

フォームバリデーション関数を提供します。

**エクスポート:**

- `validateAuthForm(data, t)`: サインイン/サインアップフォームのバリデーション
  - メールアドレス形式、パスワード最小長、確認パスワード一致などをチェック
  - 戻り値: エラーメッセージオブジェクト

- `validatePasswordForm(data, t)`: パスワードリセット時のバリデーション
  - パスワード最小長、確認パスワード一致などをチェック
  - 戻り値: エラーメッセージオブジェクト

#### lib/utils/errors.ts

エラーハンドリング関数を提供します。

**エクスポート:**

- `getErrorMessage(errorCode, t)`: Firebaseエラーコードを多言語対応メッセージに変換
  - サポートするエラーコード: auth/invalid-credential, auth/email-already-in-use, auth/weak-password など
  - 戻り値: 翻訳済みのエラーメッセージ

## 認証フロー

### 1. サインアップ (Sign Up)

**ページ:** `src/pages/index.tsx` (signup タブ)

**処理フロー:**

1. ユーザーがメールアドレスとパスワードを入力
2. フォームバリデーション実行
   - メールアドレス形式チェック
   - パスワード最低6文字
   - パスワード確認一致チェック
3. `signUp(email, password)` を呼び出し
4. Firebase Authentication でアカウント作成
5. 初期設定データを Firestore に作成
6. ログイン完了後、`/app` へリダイレクト

**エラーハンドリング:**

- `auth/email-already-in-use`: メールアドレスが既に登録されている
- `auth/weak-password`: パスワードが弱い
- `auth/invalid-email`: メールアドレス形式が無効
- その他の Firebase エラーは多言語対応で表示

### 2. ログイン (Sign In)

**ページ:** `src/pages/index.tsx` (signin タブ)

**処理フロー:**

1. ユーザーがメールアドレスとパスワードを入力
2. フォームバリデーション実行
3. `signIn(email, password)` を呼び出し
4. Firebase Authentication でログイン
5. ログイン完了後、`/app` へリダイレクト

**エラーハンドリング:**

- `auth/invalid-credential`: メールアドレスまたはパスワードが正しくない
- `auth/user-not-found`: アカウントが見つからない
- `auth/too-many-requests`: ログイン試行回数が多すぎる
- その他のエラーは多言語対応で表示

### 3. パスワードリセット (Password Reset)

パスワードリセット機能は2つのステップで構成されます：

#### ステップ1: リセットメール送信

**ページ:** `src/pages/index.tsx` (reset タブ)

**処理フロー:**

1. ユーザーがメールアドレスを入力（signin/signup タブから切り替えた場合、以前入力したアドレスが保持される）
2. フォームバリデーション実行
3. `sendPasswordResetEmail(email, language?)` を呼び出し（言語はオプション）
4. 指定された言語でメールを送信するため、Firebase Auth インスタンスの言語を設定
   - パラメータで言語が指定されている場合はその言語を使用
   - 指定されていない場合は現在のユーザーの言語設定を使用
   - デフォルトは日本語（`ja`）
5. Firebase がメールアドレス確認メールを指定された言語で送信
6. メール内のリセットリンクにはクエリパラメータ `oobCode` が含まれる
7. ユーザーに成功メッセージを表示

**ユーザー体験:**

- 各タブ（signin/signup/reset）に入力したメールアドレスは、タブを切り替えても保持されます
- これにより、ログインできない場合にすぐにパスワードリセットタブに切り替えて、同じメールアドレスでリセットメールを送信できます

**メールテンプレート:**
Firebase Console で設定可能なカスタムメールテンプレートにより、リセットリンクが生成されます。
デフォルトではリセットリンクは以下のようなフォーマットになります：

```
https://[PROJECT].firebaseapp.com/password-reset?oobCode=[CODE]&mode=resetPassword
```

#### ステップ2: パスワード再設定

**ページ:** `src/pages/password_reset.tsx`

**処理フロー:**

1. ユーザーがメール内のリセットリンクをクリック
2. URL クエリパラメータから `oobCode` を取得
3. `verifyPasswordResetCode(oobCode)` でコードを検証
   - 無効なコード: エラーメッセージ表示（"パスワードリセットリンクが無効です"）
   - 期限切れコード: エラーメッセージ表示（"パスワードリセットリンクの有効期限が切れています"）
4. 検証成功時、新しいパスワード入力フォームを表示
5. ユーザーが新しいパスワードを入力（確認を含む）
6. フォームバリデーション実行
   - パスワード最低6文字
   - パスワード確認一致チェック
7. `confirmPasswordReset(oobCode, newPassword)` を呼び出し
8. Firebase でパスワードを更新
9. 成功メッセージを表示後、`/` へリダイレクト

**エラーハンドリング:**

- `auth/expired-action-code`: リセットリンクの有効期限が切れている
- `auth/invalid-action-code`: リセットリンクが無効
- `auth/weak-password`: 入力されたパスワードが弱い
- `auth/too-many-requests`: リクエスト数が多すぎる
- その他の Firebase エラーは多言語対応で表示

## API インターフェース

### signUp(email: string, password: string): Promise<void>

Firebase Authentication でメール/パスワード認証によるサインアップを実行します。

**パラメータ:**

- `email`: メールアドレス
- `password`: パスワード（6文字以上推奨）

**動作:**

1. `createUserWithEmailAndPassword` でアカウント作成
2. 初期設定データを Firestore に作成：
   - `settings`: テーマ、言語、タスク挿入位置など
   - `taskListOrder`: タスクリストの順序
   - `taskLists`: 空のタスクリスト

**例外:**
Firebase 認証エラーをスロー

### signIn(email: string, password: string): Promise<void>

Firebase Authentication でメール/パスワード認証によるログインを実行します。

**パラメータ:**

- `email`: メールアドレス
- `password`: パスワード

**動作:**

- `signInWithEmailAndPassword` でログイン

**例外:**
Firebase 認証エラーをスロー

### sendPasswordResetEmail(email: string, language?: Language): Promise<void>

パスワードリセットメールを指定された言語で送信します。

**パラメータ:**

- `email`: メールアドレス
- `language`: メールの言語（オプション）。`"ja"` または `"en"`
  - 指定されない場合は、現在のユーザーの言語設定（`settings.language`）を使用
  - ユーザーがログインしていない場合はデフォルトの日本語（`"ja"`）を使用

**動作:**

1. 指定された言語でメール送信するため、Firebase Auth インスタンスの言語コードを設定
2. Firebase がパスワードリセットメールを指定された言語で送信
3. メール内のリンクに `oobCode` クエリパラメータが含まれる
4. デフォルトではプロジェクトの Firebase ホスティング URL にリダイレクト

**環境変数:**

- `NEXT_PUBLIC_PASSWORD_RESET_URL`: パスワードリセットページの URL（デフォルト: `http://localhost:3000`）

**例外:**
Firebase 認証エラーをスロー

### verifyPasswordResetCode(code: string): Promise<string>

パスワードリセットコードを検証し、対象のメールアドレスを返します。

**パラメータ:**

- `code`: `oobCode` クエリパラメータの値

**戻り値:**

- メールアドレス（コードが有効な場合）

**例外:**

- `auth/expired-action-code`: リセットリンクの有効期限が切れている
- `auth/invalid-action-code`: リセットリンクが無効

### confirmPasswordReset(code: string, newPassword: string): Promise<void>

新しいパスワードを確定してパスワードを更新します。

**パラメータ:**

- `code`: `oobCode` クエリパラメータの値
- `newPassword`: 新しいパスワード（6文字以上推奨）

**動作:**

1. Firebase でパスワードを更新
2. 古いセッションは無効化される

**例外:**
Firebase 認証エラーをスロー

### signOut(): Promise<void>

現在のユーザーをログアウトします。

**動作:**

- Firebase Authentication セッションを終了
- ユーザーは `/` へリダイレクト

### deleteAccount(): Promise<void>

現在のユーザーアカウントとすべての関連データを削除します。

**動作:**

1. Firestore からユーザーデータを削除
2. Firebase Authentication からアカウントを削除
3. ユーザーは `/` へリダイレクト

**注意:**
この操作は取り消せません。

## 設定機能（Settings）

設定ページは `src/pages/settings.tsx` に実装されています。

### 設定ページの機能

#### 1. ユーザー情報表示

- ログイン中のメールアドレスを表示
- 認証状態を確認し、未認証時はログインページへリダイレクト

#### 2. テーマ設定

テーマは3つのオプションから選択できます：

- **システム**: OS の設定に従う（`prefers-color-scheme`）
- **ライト**: 常にライトモードを使用
- **ダーク**: 常にダークモードを使用

**実装詳細:**

- テーマ選択はラジオボタンで実装
- 選択後、`updateSettings({ theme })` で Firestore に保存
- `_app.tsx` でテーマを監視し、HTML の `dark` クラスを切り替え
- Tailwind CSS の `dark:` プレフィックスでダークモード対応

**テーマ適用ロジック:**

```typescript
// _app.tsx の applyTheme 関数
const isDark =
  theme === "dark" ||
  (theme === "system" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", isDark);
```

#### 3. 言語設定

2つの言語から選択できます：

- **日本語** (`ja`)
- **English** (`en`)

**実装詳細:**

- 言語選択はラジオボタンで実装
- `updateSettings({ language })`で Firestore に保存
- `i18next.changeLanguage()` で UI の言語を即座に切り替え
- 言語変更後、自動的に UI テキストが更新される

#### 4. ログアウト

ログアウトボタンは以下の動作を実行します：

1. 確認ダイアログを表示
2. ユーザーが確認後、`signOut()` を呼び出し
3. Firebase セッションを終了
4. ログインページ (`/`) へリダイレクト

#### 5. アカウント削除

アカウント削除ボタンは以下の動作を実行します：

1. 警告メッセージ付きの確認ダイアログを表示（この操作は取り消せないことを明示）
2. ユーザーが確認後、`deleteAccount()` を呼び出し
3. Firestore のユーザーデータを削除
4. Firebase Authentication のアカウントを削除
5. ログインページ (`/`) へリダイレクト

**注意:**
この操作は取り消せません。

### API インターフェース

### updateSettings(settings: Partial<Settings>): Promise<void>

ユーザー設定を更新します。

**パラメータ:**

- `settings`: 更新対象の設定オブジェクト
  - `theme?: Theme` - テーマ（"system" | "light" | "dark"）
  - `language?: Language` - 言語（"ja" | "en"）
  - その他の設定フィールドも対応

**動作:**

1. ローカルストアを楽観的に更新
2. Firestore に非同期で保存
3. `updatedAt` タイムスタンプを自動設定

**例外:**
Firebase Firestore のエラーをスロー

### 多言語対応

設定ページのすべてのテキストは i18next を使用して多言語対応されています。

**メッセージキー:**

```
settings:
  title: ページタイトル
  userInfo:
    title: ユーザー情報セクションのタイトル
    email: メールアドレスのラベル
  theme:
    title: テーマ設定のタイトル
    system: システム設定オプション
    light: ライト設定オプション
    dark: ダーク設定オプション
  language:
    title: 言語設定のタイトル
    japanese: 日本語オプション
    english: English オプション
  danger:
    title: 危険な操作セクションのタイトル
    signOut: ログアウトボタンテキスト
    deleteAccount: アカウント削除ボタンテキスト
```

### テーマ設定の技術仕様

**Tailwind CSS 設定:**

`tailwind.config.js` で `darkMode: "class"` を指定しており、HTML の `class="dark"` で切り替え。

**CSS:**

`globals.css` で `html.dark` に対して `color-scheme: dark` を設定。

**システムテーマ検出:**

`prefers-color-scheme` メディアクエリで OS の設定を監視。テーマが "system" に設定されている場合、OS の設定変更時に自動的に UI が更新される。

## 多言語対応

すべての認証メッセージは i18next を使用して多言語対応されています。

**サポート言語:**

- 日本語 (`ja`)
- 英語 (`en`)

**メッセージキー:**

```
auth:
  form: メールアドレス、パスワード入力フィールド
  validation: フォームバリデーションエラーメッセージ
  error: Firebase 認証エラーメッセージ
  button: ボタンテキスト
  passwordReset: パスワードリセット関連メッセージ
  placeholder: 入力フィールドのプレースホルダー
  signOutConfirm: ログアウト確認ダイアログ
  deleteAccountConfirm: アカウント削除確認ダイアログ
  tabs: タブラベル（signin, signup）
```

詳細は `locales/ja.json` および `locales/en.json` を参照してください。

## ページコンポーネント実装

### index.tsx（認証ページ）

3つのタブを備えた統一された認証ページです。

**機能:**

- **Sign In タブ**: メールアドレスとパスワードでログイン
- **Sign Up タブ**: メールアドレス、パスワード、パスワード確認でアカウント作成
- **Password Reset タブ**: パスワードリセットメール送信

**使用コンポーネント:**

- FormInput: フォーム入力
- ErrorMessage: エラー表示
- SuccessMessage: 成功メッセージ表示

**使用ユーティリティ:**

- validateAuthForm: フォームバリデーション
- getErrorMessage: エラーメッセージ変換

### password_reset.tsx（パスワードリセット実行ページ）

メール内のリセットリンクから遷移し、新しいパスワード設定を行うページです。

**機能:**

- リセットコード検証（無効なコード、期限切れコードの判定）
- 新しいパスワード入力フォーム
- パスワード更新後、ログインページへリダイレクト

**使用コンポーネント:**

- FormInput: パスワード入力
- ErrorMessage: エラー表示
- SuccessMessage: 成功メッセージ表示
- Spinner: ローディング表示

**使用ユーティリティ:**

- validatePasswordForm: パスワード入力フォームのバリデーション
- getErrorMessage: エラーメッセージ変換

## 状態管理

### AppState

```typescript
interface AppState {
  user: User | null;
  settings: Settings;
  taskListOrder: TaskListOrder;
  taskLists: Record<string, TaskList>;
}
```

**ユーザー状態の監視:**

`appStore.subscribe()` を使用して AppState の変更を監視できます。

```typescript
const unsubscribe = appStore.subscribe((newState) => {
  setState(newState);
});
```

## Firebase Emulator

開発時には Firebase Emulator を使用してローカル環境でテストできます。

**環境変数:**

```
NEXT_PUBLIC_USE_EMULATOR=true
```

**接続先:**

- Authentication Emulator: `http://localhost:9099`
- Firestore Emulator: `localhost:8081`

## セキュリティに関する注意

1. **パスワード強度:**
   - 最低6文字を推奨
   - 本番環境ではさらに強力なパスワード要件の実装を検討してください

2. **セッション管理:**
   - Firebase Authentication は自動的にセッションを管理します
   - `onAuthStateChanged` で認証状態の変化を監視

3. **データ保護:**
   - ユーザーデータは Firestore に保存されます
   - Firestore Security Rules で適切にアクセス制御してください

4. **パスワードリセット:**
   - リセットリンクの有効期限は Firebase の設定に従います（デフォルト: 24時間）
   - メールアドレスはユーザーのコンテキストで検証されます

## トラブルシューティング

### パスワードリセットメールが届かない

1. メールアドレスの登録を確認
2. Firestore の設定でメール送信が有効化されているか確認
3. Firebase Console でカスタムメールテンプレートが正しく設定されているか確認

### リセットリンクが無効

1. リンクの有効期限を確認（デフォルト: 24時間）
2. リンクが正しくコピーされているか確認
3. ブラウザのクッキーやストレージをクリアして再度試行

### パスワード変更後のログイン

- 新しいパスワードを使用してログインしてください
- 古いセッションは無効化されます
