import {
  doc,
  updateDoc,
  deleteField,
  collection,
  writeBatch,
  runTransaction,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import {
  Settings,
  Task,
  TaskListOrderStore,
  TaskListStore,
  TaskListStoreTask,
} from "@/lib/types";
import { getData, commit } from "@/lib/store";
import {
  calculateOrderForInsert,
  reindexOrders,
  shouldReindex,
  calculateDragDropOrder,
} from "@/lib/utils/order";

export async function updateSettings(settings: Partial<Settings>) {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const now = Date.now();
  const prevSettings = data.settings ? { ...data.settings } : null;

  if (data.settings) {
    data.settings = {
      ...data.settings,
      ...settings,
      updatedAt: now,
    };
  }

  commit();

  try {
    const updates: Record<string, unknown> = {
      ...settings,
      updatedAt: now,
    };
    await updateDoc(doc(db, "settings", uid), updates);
  } catch (error) {
    if (prevSettings && data.settings) {
      data.settings = prevSettings;
      commit();
    }
    throw error;
  }
}

/**
 * TaskList 並び順更新（ドラッグ&ドロップ時）
 * 浮動小数 order を使用し、ドラッグされた TaskList のみの order 更新で完結
 *
 * @param draggedTaskListId ドラッグされた TaskList ID
 * @param targetTaskListId ドロップ先 TaskList ID（この前に挿入）
 */
export async function updateTaskListOrder(
  draggedTaskListId: string,
  targetTaskListId: string,
) {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  if (!data.taskListOrder) throw new Error("TaskListOrder not found");

  const taskListOrders = Object.entries(data.taskListOrder)
    .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
    .map(([id, value]) => ({
      id,
      order: (value as { order: number }).order,
    }));

  // 浮動小数 order を計算
  const { newOrder, needsReindexing } = calculateDragDropOrder(
    taskListOrders,
    draggedTaskListId,
    targetTaskListId,
  );

  const now = Date.now();

  try {
    if (needsReindexing) {
      const reindexedTaskLists = reindexOrders(taskListOrders);

      // ローカルステート更新
      reindexedTaskLists.forEach((tl) => {
        if (data.taskListOrder && data.taskListOrder[tl.id]) {
          data.taskListOrder[tl.id].order = tl.order;
        }
      });
      data.taskListOrder.updatedAt = now;

      commit();

      // reindex 実行
      const updateData: Record<string, unknown> = { updatedAt: now };
      reindexedTaskLists.forEach((tl) => {
        updateData[tl.id] = { order: tl.order };
      });
      await updateDoc(doc(db, "taskListOrder", uid), updateData);
    } else {
      // reindex が不要：ドラッグされた TaskList のみ order 更新

      // ローカルステート更新
      if (data.taskListOrder[draggedTaskListId]) {
        data.taskListOrder[draggedTaskListId].order = newOrder;
        data.taskListOrder.updatedAt = now;
      }

      commit();

      await updateDoc(doc(db, "taskListOrder", uid), {
        [draggedTaskListId]: { order: newOrder },
        updatedAt: now,
      });
    }
  } catch (error) {
    throw error;
  }
}

export async function createTaskList(
  name: string,
  background: string = "#ffffff",
) {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const taskListId = doc(collection(db, "taskLists")).id;

  // TaskList の order を計算（浮動小数を使用）
  const taskListOrders =
    Object.entries(data.taskListOrder || {})
      .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
      .map(([, value]) => (value as { order: number }).order) || [];

  let newOrder: number;
  if (taskListOrders.length === 0) {
    newOrder = 1.0;
  } else {
    const maxOrder = Math.max(...taskListOrders);
    newOrder = maxOrder + 1.0;
  }

  const now = Date.now();
  const newTaskList: TaskListStore = {
    id: taskListId,
    name,
    tasks: {},
    history: [],
    shareCode: null,
    background,
    createdAt: now,
    updatedAt: now,
  };
  data.taskLists[taskListId] = newTaskList;
  if (data.taskListOrder) {
    data.taskListOrder[taskListId] = { order: newOrder };
    data.taskListOrder.updatedAt = now;
  }

  commit();

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "taskLists", taskListId), newTaskList);
    batch.update(doc(db, "taskListOrder", uid), {
      [taskListId]: { order: newOrder },
      updatedAt: now,
    });
    await batch.commit();
  } catch (error) {
    throw error;
  }

  return taskListId;
}

export async function updateTaskList(
  taskListId: string,
  updates: Partial<Omit<TaskListStore, "id" | "createdAt" | "updatedAt">>,
) {
  const data = getData();

  const now = Date.now();

  if (data.taskLists[taskListId]) {
    data.taskLists[taskListId] = {
      ...data.taskLists[taskListId],
      ...updates,
      updatedAt: now,
    };
  }

  commit();

  try {
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };
    await updateDoc(doc(db, "taskLists", taskListId), updateData);
  } catch (error) {
    throw error;
  }
}

export async function deleteTaskList(taskListId: string) {
  const data = getData();

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

  commit();

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
}

export async function addTask(
  taskListId: string,
  text: string,
  date: string = "",
) {
  const data = getData();

  const taskId = doc(collection(db, "taskLists")).id;

  const taskListData: TaskListStore = data.taskLists[taskListId];
  if (!taskListData) throw new Error("Task list not found");

  const tasks = Object.values(taskListData.tasks);
  const insertPosition = data.settings?.taskInsertPosition || "bottom";

  // 浮動小数 order を計算
  let newOrder = calculateOrderForInsert(
    tasks.map((t) => ({ id: t.id, order: t.order })),
    insertPosition as "top" | "bottom",
  );

  // reindex が必要かチェック
  if (shouldReindex([...tasks.map((t) => t.order), newOrder])) {
    const reindexedTasks = reindexOrders(tasks);
    // reindex 実行時は新規タスクを末尾に追加
    newOrder = Math.max(...reindexedTasks.map((t) => t.order)) + 1.0;

    // 既存タスクの order を更新
    reindexedTasks.forEach((task) => {
      data.taskLists[taskListId].tasks[task.id].order = task.order;
    });
  }

  const now = Date.now();
  const newTask = {
    id: taskId,
    text,
    completed: false,
    date,
    order: newOrder,
  };
  data.taskLists[taskListId].tasks[taskId] = newTask;
  data.taskLists[taskListId].updatedAt = now;

  commit();

  try {
    // トランザクション使用：既存 order の更新 + 新規タスク追加を一度に実行
    await runTransaction(db, async (transaction) => {
      const taskListRef = doc(db, "taskLists", taskListId);
      const taskListSnap = await transaction.get(taskListRef);
      const currentTaskList = taskListSnap.data() as TaskListStore;

      const updateData: Record<string, unknown> = {
        [`tasks.${taskId}`]: newTask,
        updatedAt: now,
      };

      // reindex が実行されていれば、既存タスクの order も更新
      if (shouldReindex([...tasks.map((t) => t.order), newOrder])) {
        Object.entries(data.taskLists[taskListId].tasks).forEach(
          ([id, task]) => {
            if (id !== taskId) {
              updateData[`tasks.${id}.order`] = task.order;
            }
          },
        );
      }

      transaction.update(taskListRef, updateData);
    });
  } catch (error) {
    throw error;
  }

  return taskId;
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>,
) {
  const data = getData();

  const now = Date.now();

  if (data.taskLists[taskListId] && data.taskLists[taskListId].tasks[taskId]) {
    data.taskLists[taskListId].tasks[taskId] = {
      ...data.taskLists[taskListId].tasks[taskId],
      ...updates,
    };
    data.taskLists[taskListId].updatedAt = now;
  }

  commit();

  try {
    const taskListRef = doc(db, "taskLists", taskListId);
    const updateData: Record<string, unknown> = { updatedAt: now };
    Object.entries(updates).forEach(([key, value]) => {
      updateData[`tasks.${taskId}.${key}`] = value;
    });
    await updateDoc(taskListRef, updateData);
  } catch (error) {
    throw error;
  }
}

export async function deleteTask(taskListId: string, taskId: string) {
  const data = getData();

  const now = Date.now();

  if (data.taskLists[taskListId]) {
    const newTasks = { ...data.taskLists[taskListId].tasks };
    delete newTasks[taskId];
    data.taskLists[taskListId].tasks = newTasks;
    data.taskLists[taskListId].updatedAt = now;
  }

  commit();

  try {
    const taskListRef = doc(db, "taskLists", taskListId);
    await updateDoc(taskListRef, {
      [`tasks.${taskId}`]: deleteField(),
      updatedAt: now,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * タスク並び順更新（ドラッグ&ドロップ時）
 * 浮動小数 order を使用し、ドラッグされたタスクのみの order 更新で完結
 *
 * @param taskListId タスクリスト ID
 * @param draggedTaskId ドラッグされたタスク ID
 * @param targetTaskId ドロップ先タスク ID（この前に挿入）
 */
export async function updateTasksOrder(
  taskListId: string,
  draggedTaskId: string,
  targetTaskId: string,
) {
  const data = getData();

  const taskListData = data.taskLists[taskListId];
  if (!taskListData) throw new Error("Task list not found");

  const tasks = Object.values(taskListData.tasks);

  // 浮動小数 order を計算
  const { newOrder, needsReindexing } = calculateDragDropOrder(
    tasks.map((t) => ({ id: t.id, order: t.order })),
    draggedTaskId,
    targetTaskId,
  );

  const now = Date.now();

  try {
    // reindex が必要な場合の処理
    if (needsReindexing) {
      const reindexedTasks = reindexOrders(tasks);

      // ローカルステート更新
      reindexedTasks.forEach((task) => {
        data.taskLists[taskListId].tasks[task.id].order = task.order;
      });
      data.taskLists[taskListId].updatedAt = now;

      commit();

      // トランザクション：全タスクの order を再割り当て
      await runTransaction(db, async (transaction) => {
        const taskListRef = doc(db, "taskLists", taskListId);
        const updateData: Record<string, unknown> = { updatedAt: now };

        reindexedTasks.forEach((task) => {
          updateData[`tasks.${task.id}.order`] = task.order;
        });

        transaction.update(taskListRef, updateData);
      });
    } else {
      // reindex が不要：ドラッグされたタスクのみ order 更新

      // ローカルステート更新
      if (data.taskLists[taskListId].tasks[draggedTaskId]) {
        data.taskLists[taskListId].tasks[draggedTaskId].order = newOrder;
        data.taskLists[taskListId].updatedAt = now;
      }

      commit();

      // トランザクション：ドラッグされたタスクのみ更新
      await runTransaction(db, async (transaction) => {
        const taskListRef = doc(db, "taskLists", taskListId);
        transaction.update(taskListRef, {
          [`tasks.${draggedTaskId}.order`]: newOrder,
          updatedAt: now,
        });
      });
    }
  } catch (error) {
    throw error;
  }
}

function generateRandomShareCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function isShareCodeUnique(shareCode: string): Promise<boolean> {
  const taskListsRef = collection(db, "taskLists");
  const q = query(taskListsRef, where("shareCode", "==", shareCode));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function generateShareCode(taskListId: string): Promise<string> {
  const data = getData();

  if (!data.taskLists[taskListId]) {
    throw new Error("Task list not found");
  }

  let shareCode: string;
  let isUnique = false;

  while (!isUnique) {
    shareCode = generateRandomShareCode();
    isUnique = await isShareCodeUnique(shareCode);
  }

  const now = Date.now();
  data.taskLists[taskListId].shareCode = shareCode;
  data.taskLists[taskListId].updatedAt = now;

  commit();

  try {
    await updateDoc(doc(db, "taskLists", taskListId), {
      shareCode,
      updatedAt: now,
    });
  } catch (error) {
    data.taskLists[taskListId].shareCode = null;
    commit();
    throw error;
  }

  return shareCode;
}

export async function removeShareCode(taskListId: string): Promise<void> {
  const data = getData();

  if (!data.taskLists[taskListId]) {
    throw new Error("Task list not found");
  }

  const now = Date.now();
  data.taskLists[taskListId].shareCode = null;
  data.taskLists[taskListId].updatedAt = now;

  commit();

  try {
    await updateDoc(doc(db, "taskLists", taskListId), {
      shareCode: null,
      updatedAt: now,
    });
  } catch (error) {
    data.taskLists[taskListId].shareCode = null;
    commit();
    throw error;
  }
}

export async function fetchTaskListByShareCode(
  shareCode: string,
): Promise<TaskListStore | null> {
  const taskListsRef = collection(db, "taskLists");
  const q = query(taskListsRef, where("shareCode", "==", shareCode));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docData = querySnapshot.docs[0];
  return docData.data() as TaskListStore;
}

export async function addSharedTaskListToOrder(
  taskListId: string,
): Promise<void> {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  if (!data.taskListOrder) {
    throw new Error("TaskListOrder not found");
  }

  if (data.taskListOrder[taskListId]) {
    throw new Error("This task list is already in your order");
  }

  const taskListOrders =
    Object.entries(data.taskListOrder)
      .filter(([key]) => key !== "createdAt" && key !== "updatedAt")
      .map(([, value]) => (value as { order: number }).order) || [];

  let newOrder: number;
  if (taskListOrders.length === 0) {
    newOrder = 1.0;
  } else {
    const maxOrder = Math.max(...taskListOrders);
    newOrder = maxOrder + 1.0;
  }

  const now = Date.now();

  if (data.taskListOrder) {
    data.taskListOrder[taskListId] = { order: newOrder };
    data.taskListOrder.updatedAt = now;
  }

  commit();

  try {
    await updateDoc(doc(db, "taskListOrder", uid), {
      [taskListId]: { order: newOrder },
      updatedAt: now,
    });
  } catch (error) {
    if (data.taskListOrder) {
      delete data.taskListOrder[taskListId];
      commit();
    }
    throw error;
  }
}
