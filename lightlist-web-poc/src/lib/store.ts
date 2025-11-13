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

type DataStore = {
  user: User | null;
  settings: SettingsStore | null;
  taskListOrder: TaskListOrderStore | null;
  taskLists: {
    [taskListId: string]: TaskListStore;
  };
};

type StoreListener = (state: AppState) => void;

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    ),
  );
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
                (a[1] as unknown as { order: number }).order -
                (b[1] as unknown as { order: number }).order,
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

  const listeners = new Set<StoreListener>();
  const unsubscribers: (() => void)[] = [];

  const emit = (() => {
    let emitScheduled = false;
    let prevState: AppState | null = null;

    return () => {
      if (emitScheduled) return;
      emitScheduled = true;

      requestAnimationFrame(() => {
        emitScheduled = false;
        const nextState = transform(data);
        if (!prevState || !deepEqual(prevState, nextState)) {
          prevState = nextState;
          listeners.forEach((listener) => listener(nextState));
        }
      });
    };
  })();

  const subscribeToUserData = (uid: string) => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers.length = 0;

    const settingsUnsub = onSnapshot(doc(db, "settings", uid), (snapshot) => {
      if (snapshot.exists()) {
        data.settings = snapshot.data() as SettingsStore;
      } else {
        data.settings = null;
      }
      emit();
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
        emit();
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
      emit();
      return;
    }

    const taskListIds = Object.entries(taskListOrder)
      .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
      .map(([id]) => id);

    if (taskListIds.length === 0) {
      data.taskLists = {};
      emit();
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
          emit();
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
    emit();
  });

  const store = {
    getState: (): AppState => transform(data),
    subscribe: (listener: StoreListener) => {
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

      const now = Date.now();

      if (data.settings) {
        data.settings = {
          ...data.settings,
          ...settings,
          updatedAt: now,
        };
      }

      emit();

      try {
        const updates: Record<string, unknown> = {
          ...settings,
          updatedAt: now,
        };
        await updateDoc(doc(db, "settings", uid), updates as any);
      } catch (error) {
        throw error;
      }
    },
    updateTaskListOrder: async (
      taskListOrder: Omit<TaskListOrderStore, "createdAt" | "updatedAt">,
    ) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      const now = Date.now();

      if (data.taskListOrder) {
        data.taskListOrder = {
          ...data.taskListOrder,
          ...taskListOrder,
          updatedAt: now,
        } as TaskListOrderStore;
      }

      emit();

      try {
        const updates: Record<string, unknown> = {
          ...taskListOrder,
          updatedAt: now,
        };
        await updateDoc(doc(db, "taskListOrder", uid), updates as any);
      } catch (error) {
        throw error;
      }
    },
    createTaskList: async (name: string, background: string = "#ffffff") => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      const taskListId = doc(collection(db, "taskLists")).id;

      const maxOrder =
        Object.values(data.taskListOrder || {})
          .filter(
            (item) =>
              typeof item === "object" && item !== null && "order" in item,
          )
          .map((item) => (item as { order: number }).order)
          .reduce((max, order) => Math.max(max, order), -1) + 1;

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

      emit();

      try {
        const batch = writeBatch(db);
        batch.set(doc(db, "taskLists", taskListId), newTaskList);
        batch.update(doc(db, "taskListOrder", uid), {
          [taskListId]: { order: maxOrder },
          updatedAt: now,
        });
        await batch.commit();
      } catch (error) {
        throw error;
      }

      return taskListId;
    },
    updateTaskList: async (
      taskListId: string,
      updates: Partial<Omit<TaskListStore, "id" | "createdAt" | "updatedAt">>,
    ) => {
      const now = Date.now();

      if (data.taskLists[taskListId]) {
        data.taskLists[taskListId] = {
          ...data.taskLists[taskListId],
          ...updates,
          updatedAt: now,
        };
      }

      emit();

      try {
        const updateData: Record<string, unknown> = {
          ...updates,
          updatedAt: now,
        };
        await updateDoc(doc(db, "taskLists", taskListId), updateData as any);
      } catch (error) {
        throw error;
      }
    },
    deleteTaskList: async (taskListId: string) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("No user logged in");

      const now = Date.now();

      delete data.taskLists[taskListId];
      if (data.taskListOrder) {
        const newTaskListOrder = { ...data.taskListOrder };
        delete newTaskListOrder[taskListId];
        newTaskListOrder.updatedAt = now;
        data.taskListOrder = newTaskListOrder;
      }

      emit();

      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, "taskLists", taskListId));
        batch.update(doc(db, "taskListOrder", uid), {
          [taskListId]: deleteField(),
          updatedAt: now,
        });
        await batch.commit();
      } catch (error) {
        throw error;
      }
    },
    addTask: async (taskListId: string, text: string, date: string = "") => {
      const taskId = doc(collection(db, "taskLists")).id;

      const taskListData = data.taskLists[taskListId];
      if (!taskListData) throw new Error("Task list not found");

      const maxOrder =
        Object.values(taskListData.tasks)
          .map((task) => task.order)
          .reduce((max, order) => Math.max(max, order), -1) + 1;

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

      emit();

      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        await updateDoc(taskListRef, {
          [`tasks.${taskId}`]: newTask,
          updatedAt: now,
        });
      } catch (error) {
        throw error;
      }

      return taskId;
    },
    updateTask: async (
      taskListId: string,
      taskId: string,
      updates: Partial<Task>,
    ) => {
      const now = Date.now();

      if (
        data.taskLists[taskListId] &&
        data.taskLists[taskListId].tasks[taskId]
      ) {
        data.taskLists[taskListId].tasks[taskId] = {
          ...data.taskLists[taskListId].tasks[taskId],
          ...updates,
        };
        data.taskLists[taskListId].updatedAt = now;
      }

      emit();

      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        const updateData: Record<string, unknown> = { updatedAt: now };
        Object.entries(updates).forEach(([key, value]) => {
          updateData[`tasks.${taskId}.${key}`] = value;
        });
        await updateDoc(taskListRef, updateData as any);
      } catch (error) {
        throw error;
      }
    },
    deleteTask: async (taskListId: string, taskId: string) => {
      const now = Date.now();

      if (data.taskLists[taskListId]) {
        const newTasks = { ...data.taskLists[taskListId].tasks };
        delete newTasks[taskId];
        data.taskLists[taskListId].tasks = newTasks;
        data.taskLists[taskListId].updatedAt = now;
      }

      emit();

      try {
        const taskListRef = doc(db, "taskLists", taskListId);
        await updateDoc(taskListRef, {
          [`tasks.${taskId}`]: deleteField(),
          updatedAt: now,
        });
      } catch (error) {
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
