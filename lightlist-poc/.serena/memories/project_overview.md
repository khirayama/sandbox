# LightList POC プロジェクト概要

## プロジェクト目的

React Native + Firebaseを使用したクロスプラットフォーム対応のリアルタイム共有TODOリストアプリケーション

## 技術スタック

- Frontend Framework: React Native (Expo SDK 52)
- Routing: Expo Router
- Backend: Firebase (Authentication, Firestore)
- Styling: NativeWind (Tailwind CSS)
- Internationalization: i18next + react-i18next
- Type Checking: TypeScript 5.6

## プロジェクト構造

```
lib/
  ├── context/          # Reactコンテキスト
  ├── store/           # 状態管理
  ├── hooks/           # カスタムフック
  ├── components/      # 共通コンポーネント
  ├── types.ts         # TypeScript型定義（正とする）
  ├── firebase.ts      # Firebase設定
  └── i18n.ts          # i18n設定

app/
  ├── _layout.tsx      # ルートレイアウト
  ├── index.tsx        # ホーム
  ├── (auth)/          # 認証画面
  ├── (tabs)/          # タブナビゲーション
  └── list/            # リスト詳細
```

## 正とする型定義 (lib/types.ts)

- User: Firebaseの User型
- Theme: "system" | "light" | "dark"
- Language: "ja" | "en"
- TaskInsertPosition: "bottom" | "top"
- Settings: theme, language, taskInsertPosition, autoSort
- Task: id, text, completed, date, order, createdAt, updatedAt
- TaskList: id, name, tasks (Record<taskId, Task>), createdAt, updatedAt
- TaskListOrder: Record<taskListId, { order: number }>
- AppState: user, settings, taskListOrder, taskLists
