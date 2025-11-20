import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import {
  AppState,
  SettingsStore,
  TaskListStore,
  TaskListOrderStore,
  User,
} from "@/lib/types";

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
      (b as Record<string, unknown>)[key]
    )
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
                (b[1] as unknown as { order: number }).order
            )
            .map(([listId]) => {
              const listData = d.taskLists[listId];
              return {
                id: listId,
                name: listData.name,
                tasks: Object.values(listData.tasks).sort(
                  (a, b) => a.order - b.order
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

  let prevState: AppState | null = null;

  const commit = () => {
    const nextState = transform(data);
    if (!prevState || !deepEqual(prevState, nextState)) {
      prevState = nextState;
      listeners.forEach((listener) => listener(nextState));
    }
  };

  const subscribeToUserData = (uid: string) => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers.length = 0;

    const settingsUnsub = onSnapshot(doc(db, "settings", uid), (snapshot) => {
      if (snapshot.exists()) {
        data.settings = snapshot.data() as SettingsStore;
      } else {
        data.settings = null;
      }
      commit();
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
        commit();
        subscribeToTaskLists(data.taskListOrder);
      }
    );
    unsubscribers.push(taskListOrderUnsub);
  };

  const subscribeToTaskLists = (taskListOrder: TaskListOrderStore | null) => {
    const taskListUnsubscribers = unsubscribers.splice(2);
    taskListUnsubscribers.forEach((unsub) => unsub());

    if (!taskListOrder) {
      data.taskLists = {};
      commit();
      return;
    }

    const taskListIds = Object.entries(taskListOrder)
      .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
      .map(([id]) => id);

    if (taskListIds.length === 0) {
      data.taskLists = {};
      commit();
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
          commit();
        }
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
    commit();
  });

  const store = {
    getState: (): AppState => transform(data),
    getData: (): DataStore => data,
    commit,
    subscribe: (listener: StoreListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    // Actions
    unsubscribeAll: () => {
      authUnsubscribe();
      unsubscribers.forEach((unsub) => unsub());
    },
  };

  return store;
}

export const appStore = createStore();

export const { getData, commit } = appStore;
