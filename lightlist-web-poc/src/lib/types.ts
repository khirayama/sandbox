import { User as FirebaseUser } from "firebase/auth";

export type Theme = "system" | "light" | "dark";

export type Language = "ja" | "en";

export type TaskInsertPosition = "bottom" | "top";

// For Firebase/Firestore
export type User = FirebaseUser;

export type SettingsStore = {
  theme: Theme;
  language: Language;
  taskInsertPosition: TaskInsertPosition;
  autoSort: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TaskListOrderStore = {
  [taskListId: string]: {
    order: number;
  };
} & {
  createdAt: number;
  updatedAt: number;
};

export type TaskListStoreTask = {
      id: string;
      text: string;
      completed: boolean;
      date: string;
      order: number;
}

export type TaskListStore = {
  id: string;
  name: string;
  tasks: {
    [taskId: string]: TaskListStoreTask;
  };
  history: string[];
  background: string;
  createdAt: number;
  updatedAt: number;
};

// For App
// User, SettingsStore, TaskListOrderStore, TaskListStoreのデータを利用して、生成される
export type Settings = {
  theme: Theme;
  language: Language;
  taskInsertPosition: TaskInsertPosition;
  autoSort: boolean;
};

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
};

export type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
  history: string[];
  background: string;
};

export type AppState = {
  user: User | null;
  settings: Settings | null;
  taskLists: TaskList[];
};
