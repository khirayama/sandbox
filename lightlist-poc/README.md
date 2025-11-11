# LightList - リアルタイム共有TODOリスト

React Native + Firebaseを使用したクロスプラットフォーム対応のリアルタイム共有TODOリストアプリケーション

## 🚀 特徴

- 📱 **クロスプラットフォーム対応**: iOS、Android、Webで動作
- 🔄 **リアルタイム同期**: Firebaseによる即座のデータ同期
- 👥 **共有機能**: リストを他のユーザーと共有可能
- 🌍 **多言語対応**: 日本語・英語対応
- 🎨 **テーマ切り替え**: ライト/ダーク/システム設定
- 🔒 **セキュア**: Firebase Authenticationによる認証

## 📋 必要な環境

- Node.js 18以上
- npm または yarn
- Expo CLI
- Firebase プロジェクト

## 🛠️ セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/lightlist-poc.git
cd lightlist-poc
```

### 2. 依存関係のインストール

```bash
npm install --legacy-peer-deps
```

### 3. 環境変数の設定

`.env`ファイルを作成し、Firebaseの設定を追加：

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firestore Database を作成
4. セキュリティルールを設定（`docs/firestore.rules`を参照）

## 🚀 開発

### 開発サーバーの起動

```bash
npm start
```

### プラットフォーム別実行

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### ビルド

```bash
# TypeScriptの型チェック
npm run build

# コードフォーマット
npm run prettier
```

## 📁 プロジェクト構造

```
lightlist-poc/
├── app/                    # Expo Routerページ
│   ├── _layout.tsx        # ルートレイアウト
│   ├── (auth)/            # 認証画面
│   ├── (tabs)/            # タブナビゲーション
│   └── list/              # リスト詳細
├── components/            # 共通コンポーネント
├── lib/                   # ライブラリ・ユーティリティ
│   ├── context/          # Reactコンテキスト
│   ├── hooks/            # カスタムフック
│   ├── firebase.ts       # Firebase設定
│   └── types.ts          # TypeScript型定義
├── locales/              # 翻訳ファイル
├── assets/               # 画像・アイコン
└── docs/                 # ドキュメント
```

## 🔧 技術スタック

- **Frontend Framework**: React Native (Expo SDK 52)
- **Routing**: Expo Router
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: NativeWind (Tailwind CSS)
- **Internationalization**: i18next
- **Type Checking**: TypeScript

## 📱 主な機能

### 認証

- メールアドレス/パスワードでのログイン
- 新規ユーザー登録
- セキュアなログアウト

### TODOリスト管理

- リストの作成・編集・削除
- TODO項目の追加・編集・削除
- 完了/未完了の切り替え
- 優先度の設定

### 共有機能

- リストを他のユーザーと共有
- 権限管理（閲覧のみ/編集可能）
- リアルタイム同期

### UI/UX

- ダークモード対応
- 多言語対応（日本語/英語）
- レスポンシブデザイン

## 🔐 セキュリティ

- Firebase Authenticationによる認証
- Firestoreセキュリティルールによるアクセス制御
- 環境変数による機密情報の管理

## 📄 ライセンス

本プロジェクトは内部開発用のPOC（Proof of Concept）です。

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📞 サポート

質問や問題がある場合は、[Issues](https://github.com/your-username/lightlist-poc/issues)を開いてください。
