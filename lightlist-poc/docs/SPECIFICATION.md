# LightList - リアルタイム共有TODOリストアプリケーション仕様書

## 1. プロジェクト概要

**プロジェクト名**: LightList
**バージョン**: 1.0.0
**概要**: React Native + Firebaseを使用したクロスプラットフォーム対応のリアルタイム共有TODOリストアプリケーション

### 1.1 対応プラットフォーム

- iOS（iPhone / iPad）
- Android（スマートフォン / タブレット）
- Web（PWA対応）

### 1.2 技術スタック

- **フレームワーク**: React Native (Expo SDK 52)
- **ルーティング**: Expo Router
- **バックエンド**: Firebase (Authentication, Firestore)
- **スタイリング**: NativeWind (Tailwind CSS)
- **多言語対応**: i18next
- **型チェック**: TypeScript

## 2. 機能仕様

### 2.1 認証機能

#### 2.1.1 ユーザー登録

- メールアドレス、パスワード、表示名での新規登録
- パスワードの確認入力
- Firebase Authenticationを使用
- 登録後、自動的にFirestoreにユーザー情報を保存

#### 2.1.2 ログイン/ログアウト

- メールアドレス/パスワードでのログイン
- 認証状態の永続化（アプリ再起動後も維持）
- セキュアなログアウト機能

#### 2.1.3 認証状態管理

- AuthContextによるグローバル状態管理
- 未認証時は認証画面へ自動リダイレクト
- 認証済み時はメイン画面へ自動遷移

### 2.2 TODOリスト機能

#### 2.2.1 リスト管理

- TODOリストの作成
- リスト名の編集
- リストの削除
- リスト一覧表示（所有リスト + 共有されたリスト）

#### 2.2.2 TODO項目管理

- TODO項目の作成
  - タイトル（必須）
  - 説明（任意）
  - 優先度（低/中/高）
  - 期限（任意）
- TODO項目の編集
- TODO項目の削除
- 完了/未完了の切り替え
- リアルタイム同期（Firestore onSnapshot）

#### 2.2.3 表示・フィルタリング

- 完了/未完了でのソート（未完了が上）
- 作成日時での並び替え
- タスク数の表示

### 2.3 共有機能

#### 2.3.1 リスト共有

- メールアドレスでユーザーを招待
- 権限設定（閲覧のみ / 編集可能）
- 共有メンバーの一覧表示
- 共有の解除

#### 2.3.2 リアルタイム同期

- Firestoreのリアルタイムリスナーを使用
- 複数デバイス間での即座の同期
- オフライン対応（Firestoreのキャッシュ機能）

### 2.4 UI/UX機能

#### 2.4.1 テーマ設定

- ライトモード
- ダークモード
- システム設定に従う（自動切り替え）

#### 2.4.2 多言語対応

- 日本語
- 英語
- システム言語での自動選択
- 手動での言語切り替え

#### 2.4.3 アクセシビリティ

- キーボード操作対応（Web）
- スクリーンリーダー対応
- 適切なコントラスト比の確保

## 3. データ構造

### 3.1 Firestoreコレクション構造

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── todoLists/
│   └── {listId}/
│       ├── name: string
│       ├── ownerId: string
│       ├── sharedWith: Array<{userId, permission}>
│       ├── createdAt: Timestamp
│       ├── updatedAt: Timestamp
│       │
│       └── items/
│           └── {itemId}/
│               ├── title: string
│               ├── description?: string
│               ├── completed: boolean
│               ├── priority: 'low' | 'medium' | 'high'
│               ├── dueDate?: Timestamp
│               ├── createdBy: string
│               ├── createdAt: Timestamp
│               └── updatedAt: Timestamp
```

### 3.2 TypeScript型定義

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TodoList {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: {
    userId: string;
    permission: "read" | "write";
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TodoItem {
  id: string;
  listId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 4. 画面構成

### 4.1 画面遷移図

```
[起動画面]
    ├── [認証済み] → [TODOリスト一覧]
    └── [未認証] → [ログイン画面]
                      ├── [ログイン成功] → [TODOリスト一覧]
                      └── [新規登録] → [サインアップ画面]

[TODOリスト一覧] (タブ)
    ├── [リスト選択] → [TODO項目一覧]
    │                     ├── [TODO追加]
    │                     ├── [TODO編集]
    │                     └── [共有設定]
    └── [設定] → [設定画面]
                   ├── [テーマ変更]
                   ├── [言語変更]
                   └── [ログアウト] → [ログイン画面]
```

### 4.2 画面一覧

| 画面名         | パス             | 説明                                  |
| -------------- | ---------------- | ------------------------------------- |
| ログイン       | /(auth)/login    | メールアドレス/パスワードでのログイン |
| サインアップ   | /(auth)/signup   | 新規ユーザー登録                      |
| TODOリスト一覧 | /(tabs)/         | 所有/共有されたリストの一覧表示       |
| TODO項目一覧   | /list/[id]       | 特定リストのTODO項目表示・管理        |
| 設定           | /(tabs)/settings | アプリ設定、アカウント管理            |

## 5. セキュリティ

### 5.1 Firebaseセキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー情報: 本人のみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // TODOリスト: オーナーと共有メンバーのみアクセス可能
    match /todoLists/{listId} {
      allow read: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.uid in resource.data.sharedWith[*].userId
      );
      allow create: if request.auth != null &&
        request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.ownerId == request.auth.uid;

      // TODO項目: リストへのアクセス権限に準じる
      match /items/{itemId} {
        allow read: if request.auth != null;
        allow create, update, delete: if request.auth != null && (
          get(/databases/$(database)/documents/todoLists/$(listId)).data.ownerId == request.auth.uid ||
          (request.auth.uid in get(/databases/$(database)/documents/todoLists/$(listId)).data.sharedWith[*].userId &&
           get(/databases/$(database)/documents/todoLists/$(listId)).data.sharedWith[request.auth.uid].permission == 'write')
        );
      }
    }
  }
}
```

### 5.2 認証セキュリティ

- Firebase Authenticationの標準セキュリティ機能を使用
- パスワードは最低6文字以上
- メールアドレスの検証（オプション）

## 6. パフォーマンス最適化

### 6.1 データ取得

- Firestoreのリアルタイムリスナーで必要なデータのみ購読
- オフラインキャッシュの活用
- ページネーション（将来的な拡張）

### 6.2 UI最適化

- React.memoによるコンポーネントの最適化
- FlatListによる効率的なリスト表示
- 遅延ローディング

## 7. 開発環境セットアップ

### 7.1 必要な環境

- Node.js 18以上
- npm または yarn
- Expo CLI
- Firebase プロジェクト

### 7.2 セットアップ手順

1. **依存関係のインストール**

```bash
npm install --legacy-peer-deps
```

2. **環境変数の設定**
   `.env`ファイルを作成し、Firebaseの設定を追加：

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

3. **開発サーバーの起動**

```bash
npm start
```

4. **プラットフォーム別実行**

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## 8. テスト戦略

### 8.1 単体テスト

- カスタムフックのテスト
- ユーティリティ関数のテスト
- Firebaseルールのテスト

### 8.2 統合テスト

- 認証フローのテスト
- データ同期のテスト
- 共有機能のテスト

### 8.3 E2Eテスト

- 主要なユーザージャーニーのテスト
- クロスプラットフォーム動作確認

## 9. デプロイ

### 9.1 Web (PWA)

- Expo Webビルド
- Firebaseホスティングへデプロイ

### 9.2 iOS

- EAS Buildでビルド
- App Store Connectへ提出

### 9.3 Android

- EAS Buildでビルド
- Google Play Consoleへ提出

## 10. 今後の拡張予定

### Phase 2

- プッシュ通知機能
- タスクのカテゴリー分け
- 検索・フィルター機能
- タスクのソート機能

### Phase 3

- カレンダービュー
- 繰り返しタスク
- タスクのテンプレート機能
- 統計・分析機能

### Phase 4

- チーム機能
- コメント機能
- ファイル添付
- タスクの依存関係管理

## 11. メンテナンス

### 11.1 定期更新

- 依存関係の更新（月次）
- セキュリティパッチの適用
- パフォーマンスモニタリング

### 11.2 バックアップ

- Firestore自動バックアップ
- ユーザーデータのエクスポート機能

## 12. ライセンス

本プロジェクトは内部開発用のPOC（Proof of Concept）です。
