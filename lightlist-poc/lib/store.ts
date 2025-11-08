import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  deleteUser,
  ActionCodeSettings,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  AppState,
  Settings,
  TaskList,
  Task,
  SettingsStore,
  TaskListStore,
  TaskListOrderStore,
  User,
} from "./types";
import i18n from "./i18n";

/* 関数一覧
 * createStore
 *
 */

// Store
type DataStore = {
  user: User | null;
  settings: SettingsStore | null;
  taskListOrder: TaskListOrderStore | null;
  taskLists: {
    [taskListId: string]: TaskListStore;
  };
};

const transform = (d: DataStore): AppState => {
  return {
    user: d.user,
    settings: d.settings
      ? {
          theme: d.settings.theme,
          language: d.settings.language,
          taskInsertPosition: d.settings.taskInsertPosition,
          autoSort: d.settings.autoSort,
        }
      : null,
    taskLists:
      d.taskListOrder && d.taskLists
        ? Object.entries(d.taskListOrder)
            .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
            .sort(
              (a, b) =>
                (a[1] as { order: number }).order -
                (b[1] as { order: number }).order,
            )
            .map(([listId]) => {
              const listData = d.taskLists[listId];
              return {
                id: listId,
                name: listData.name,
                tasks: Object.values(listData.tasks).sort(
                  (a, b) => a.order - b.order,
                ),
                history: listData.history,
                background: listData.background,
              };
            })
        : [],
  };
};

function createStore() {
  const data: DataStore = {
    user: null,
    settings: null,
    taskListOrder: null,
    taskLists: {},
  };

  const listeners = new Set<Function>();
  const unsubscribers: (() => void)[] = [];

  const subscribeToUserData = (uid: string) => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers.length = 0;

    const settingsUnsub = onSnapshot(doc(db, "settings", uid), (snapshot) => {
      if (snapshot.exists()) {
        data.settings = snapshot.data() as SettingsStore;
      } else {
        data.settings = null;
      }
      listeners.forEach((listener) => listener(transform(data)));
    });
    unsubscribers.push(settingsUnsub);

    const taskListOrderUnsub = onSnapshot(
      doc(db, "taskListOrder", uid),
      (snapshot) => {
        if (snapshot.exists()) {
          data.taskListOrder = snapshot.data() as TaskListOrderStore;
        } else {
          data.taskListOrder = null;
        }
        listeners.forEach((listener) => listener(transform(data)));

        subscribeToTaskLists(data.taskListOrder);
      },
    );
    unsubscribers.push(taskListOrderUnsub);
  };

  const subscribeToTaskLists = (taskListOrder: TaskListOrderStore | null) => {
    const taskListUnsubscribers = unsubscribers.splice(2);
    taskListUnsubscribers.forEach((unsub) => unsub());

    if (!taskListOrder) {
      data.taskLists = {};
      listeners.forEach((listener) => listener(transform(data)));
      return;
    }

    const taskListIds = Object.entries(taskListOrder)
      .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
      .map(([id]) => id);

    if (taskListIds.length === 0) {
      data.taskLists = {};
      listeners.forEach((listener) => listener(transform(data)));
      return;
    }

    const chunks = [];
    for (let i = 0; i < taskListIds.length; i += 10) {
      chunks.push(taskListIds.slice(i, i + 10));
    }

    chunks.forEach((chunk) => {
      const taskListsUnsub = onSnapshot(
        query(collection(db, "taskLists"), where("__name__", "in", chunk)),
        (snapshot) => {
          const lists: { [taskListId: string]: TaskListStore } = {};
          snapshot.docs.forEach((doc) => {
            lists[doc.id] = doc.data() as TaskListStore;
          });
          data.taskLists = { ...data.taskLists, ...lists };
          listeners.forEach((listener) => listener(transform(data)));
        },
      );
      unsubscribers.push(taskListsUnsub);
    });
  };

  const authUnsubscribe = onAuthStateChanged(auth, (user) => {
    data.user = user;
    if (user) {
      subscribeToUserData(user.uid);
    } else {
      unsubscribers.forEach((unsub) => unsub());
      unsubscribers.length = 0;
      data.settings = null;
      data.taskListOrder = null;
      data.taskLists = {};
    }
    listeners.forEach((listener) => listener(transform(data)));
  });

  const store = {
    getState: (): AppState => transform(data),
    subscribe: (listener: Function) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    // Actions
    unsubscribeAll: () => {
      authUnsubscribe();
      unsubscribers.forEach((unsub) => unsub());
    },
    // Actions for Auth
    signUp: async (email: string, password: string) => {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const settingsData: SettingsStore = {
        theme: "system",
        language: "ja",
        taskInsertPosition: "bottom",
        autoSort: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(doc(db, "settings", uid), settingsData);

      const taskListOrderData = {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as TaskListOrderStore;
      await setDoc(doc(db, "taskListOrder", uid), taskListOrderData);
    },
    signIn: async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      await firebaseSignOut(auth);
    },
    sendPasswordResetEmail: async (email: string) => {
      const actionCodeSettings: ActionCodeSettings = {
        url: "https://lightlist.example.com",
        handleCodeInApp: false,
      };
      await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    },
    verifyPasswordResetCode: async (code: string) => {
      return await firebaseVerifyPasswordResetCode(auth, code);
    },
    confirmPasswordReset: async (code: string, newPassword: string) => {
      await firebaseConfirmPasswordReset(auth, code, newPassword);
    },
    deleteAccount: async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      const batch = writeBatch(db);
      batch.delete(doc(db, "settings", uid));
      batch.delete(doc(db, "taskListOrder", uid));

      await batch.commit();
      await deleteUser(auth.currentUser!);
    },
    // Actions for App
    updateSettings: async (settings: Partial<Settings>) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      // 1. ローカルの状態を即座に更新
      if (data.settings) {
        data.settings = {
          ...data.settings,
          ...settings,
          updatedAt: Date.now(),
        };
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const updates: Record<string, unknown> = { ...settings };
        updates.updatedAt = Date.now();
        await updateDoc(doc(db, "settings", uid), updates as any);
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
    updateTaskListOrder: async (
      taskListOrder: Omit<TaskListOrderStore, "createdAt" | "updatedAt">,
    ) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      // 1. ローカルの状態を即座に更新
      if (data.taskListOrder) {
        data.taskListOrder = {
          ...data.taskListOrder,
          ...taskListOrder,
          updatedAt: Date.now(),
        } as TaskListOrderStore;
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const updates: Record<string, unknown> = { ...taskListOrder };
        updates.updatedAt = Date.now();
        await updateDoc(doc(db, "taskListOrder", uid), updates as any);
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
    createTaskList: async (name: string, background: string = "#ffffff") => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      // 1. Firestoreが自動生成するIDを事前取得
      const taskListId = doc(collection(db, "taskLists")).id;

      // 2. maxOrder を計算
      const maxOrder =
        Object.values(data.taskListOrder || {})
          .filter(
            (item) =>
              typeof item === "object" && item !== null && "order" in item,
          )
          .map((item) => (item as { order: number }).order)
          .reduce((max, order) => Math.max(max, order), -1) + 1;

      // 3. ローカルの状態を即座に更新
      const now = Date.now();
      const newTaskList: TaskListStore = {
        id: taskListId,
        name,
        tasks: {},
        history: [],
        background,
        createdAt: now,
        updatedAt: now,
      };
      data.taskLists[taskListId] = newTaskList;
      if (data.taskListOrder) {
        data.taskListOrder[taskListId] = { order: maxOrder };
        data.taskListOrder.updatedAt = now;
      }

      // 4. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 5. Firestoreへ非同期更新
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "taskLists", taskListId), newTaskList);
        batch.update(doc(db, "taskListOrder", uid), {
          [taskListId]: { order: maxOrder },
          updatedAt: now,
        });
        await batch.commit();
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }

      return taskListId;
    },
    updateTaskList: async (
      taskListId: string,
      updates: Partial<Omit<TaskListStore, "id" | "createdAt" | "updatedAt">>,
    ) => {
      // 1. ローカルの状態を即座に更新
      if (data.taskLists[taskListId]) {
        data.taskLists[taskListId] = {
          ...data.taskLists[taskListId],
          ...updates,
          updatedAt: Date.now(),
        };
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const updateData: Record<string, unknown> = { ...updates };
        updateData.updatedAt = Date.now();
        await updateDoc(doc(db, "taskLists", taskListId), updateData as any);
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
    deleteTaskList: async (taskListId: string) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      // 1. ローカルの状態を即座に更新
      delete data.taskLists[taskListId];
      if (data.taskListOrder) {
        const newTaskListOrder = { ...data.taskListOrder };
        delete newTaskListOrder[taskListId];
        newTaskListOrder.updatedAt = Date.now();
        data.taskListOrder = newTaskListOrder;
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, "taskLists", taskListId));
        batch.update(doc(db, "taskListOrder", uid), {
          [taskListId]: deleteField(),
          updatedAt: Date.now(),
        });
        await batch.commit();
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
    addTask: async (taskListId: string, text: string, date: string = "") => {
      // 1. Firestoreが自動生成するIDを事前取得
      const taskId = doc(collection(db, "taskLists")).id;

      // 2. 現在のタスクリストデータを取得
      const taskListData = data.taskLists[taskListId];
      if (!taskListData) throw new Error("Task list not found");

      // 3. maxOrder を計算
      const maxOrder =
        Object.values(taskListData.tasks)
          .map((task) => task.order)
          .reduce((max, order) => Math.max(max, order), -1) + 1;

      // 4. ローカルの状態を即座に更新
      const now = Date.now();
      const newTask = {
        id: taskId,
        text,
        completed: false,
        date,
        order: maxOrder,
      };
      data.taskLists[taskListId].tasks[taskId] = newTask;
      data.taskLists[taskListId].updatedAt = now;

      // 5. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 6. Firestoreへ非同期更新
      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        await updateDoc(taskListRef, {
          [`tasks.${taskId}`]: newTask,
          updatedAt: now,
        });
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }

      return taskId;
    },
    updateTask: async (
      taskListId: string,
      taskId: string,
      updates: Partial<Task>,
    ) => {
      // 1. ローカルの状態を即座に更新
      if (
        data.taskLists[taskListId] &&
        data.taskLists[taskListId].tasks[taskId]
      ) {
        data.taskLists[taskListId].tasks[taskId] = {
          ...data.taskLists[taskListId].tasks[taskId],
          ...updates,
        };
        data.taskLists[taskListId].updatedAt = Date.now();
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        const updateData: Record<string, unknown> = {};
        Object.entries(updates).forEach(([key, value]) => {
          updateData[`tasks.${taskId}.${key}`] = value;
        });
        updateData.updatedAt = Date.now();
        await updateDoc(taskListRef, updateData as any);
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
    deleteTask: async (taskListId: string, taskId: string) => {
      // 1. ローカルの状態を即座に更新
      if (data.taskLists[taskListId]) {
        const newTasks = { ...data.taskLists[taskListId].tasks };
        delete newTasks[taskId];
        data.taskLists[taskListId].tasks = newTasks;
        data.taskLists[taskListId].updatedAt = Date.now();
      }

      // 2. リスナーに通知（UIを即座に更新）
      listeners.forEach((listener) => listener(transform(data)));

      // 3. Firestoreへ非同期更新
      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        await updateDoc(taskListRef, {
          [`tasks.${taskId}`]: deleteField(),
          updatedAt: Date.now(),
        });
      } catch (error) {
        // エラー時は onSnapshot が自動的に正しい状態に戻す
        throw error;
      }
    },
  };

  return store;
}

export const appStore = createStore();

export const {
  signUp,
  signIn,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  createTaskList,
  updateSettings,
  addTask,
  updateTask,
  deleteTask,
} = appStore;
