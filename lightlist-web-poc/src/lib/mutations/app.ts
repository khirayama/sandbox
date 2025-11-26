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
import { getData } from "@/lib/store";
import {
  calculateOrderForInsert,
  reindexOrders,
  shouldReindex,
  calculateDragDropOrder,
} from "@/lib/utils/order";

export async function updateSettings(settings: Partial<Settings>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const now = Date.now();
  const updates: Record<string, unknown> = {
    ...settings,
    updatedAt: now,
  };
  await updateDoc(doc(db, "settings", uid), updates);
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

  const { newOrder, needsReindexing } = calculateDragDropOrder(
    taskListOrders,
    draggedTaskListId,
    targetTaskListId,
  );

  const now = Date.now();

  if (needsReindexing) {
    const reindexedTaskLists = reindexOrders(taskListOrders);
    const updateData: Record<string, unknown> = { updatedAt: now };
    reindexedTaskLists.forEach((tl) => {
      updateData[tl.id] = { order: tl.order };
    });
    await updateDoc(doc(db, "taskListOrder", uid), updateData);
  } else {
    await updateDoc(doc(db, "taskListOrder", uid), {
      [draggedTaskListId]: { order: newOrder },
      updatedAt: now,
    });
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

  const batch = writeBatch(db);
  batch.set(doc(db, "taskLists", taskListId), newTaskList);
  batch.update(doc(db, "taskListOrder", uid), {
    [taskListId]: { order: newOrder },
    updatedAt: now,
  });
  await batch.commit();

  return taskListId;
}

export async function updateTaskList(
  taskListId: string,
  updates: Partial<Omit<TaskListStore, "id" | "createdAt" | "updatedAt">>,
) {
  const now = Date.now();
  const updateData: Record<string, unknown> = {
    ...updates,
    updatedAt: now,
  };
  await updateDoc(doc(db, "taskLists", taskListId), updateData);
}

export async function deleteTaskList(taskListId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const now = Date.now();

  const batch = writeBatch(db);
  batch.delete(doc(db, "taskLists", taskListId));
  batch.update(doc(db, "taskListOrder", uid), {
    [taskListId]: deleteField(),
    updatedAt: now,
  });
  await batch.commit();
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

  let newOrder = calculateOrderForInsert(
    tasks.map((t) => ({ id: t.id, order: t.order })),
    insertPosition as "top" | "bottom",
  );

  let reindexedTasks: Array<{ id: string; order: number }> = [];
  if (shouldReindex([...tasks.map((t) => t.order), newOrder])) {
    reindexedTasks = reindexOrders(tasks);
    newOrder = Math.max(...reindexedTasks.map((t) => t.order)) + 1.0;
  }

  const now = Date.now();
  const newTask = {
    id: taskId,
    text,
    completed: false,
    date,
    order: newOrder,
  };

  await runTransaction(db, async (transaction) => {
    const taskListRef = doc(db, "taskLists", taskListId);
    const updateData: Record<string, unknown> = {
      [`tasks.${taskId}`]: newTask,
      updatedAt: now,
    };

    if (reindexedTasks.length > 0) {
      reindexedTasks.forEach((task) => {
        updateData[`tasks.${task.id}.order`] = task.order;
      });
    }

    const history = [...(taskListData.history || [])];
    if (!history.includes(text)) {
      history.unshift(text);
      if (history.length > 300) {
        history.pop();
      }
      updateData.history = history;
    }

    transaction.update(taskListRef, updateData);
  });

  return taskId;
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>,
) {
  const now = Date.now();
  const taskListRef = doc(db, "taskLists", taskListId);
  const updateData: Record<string, unknown> = { updatedAt: now };
  Object.entries(updates).forEach(([key, value]) => {
    updateData[`tasks.${taskId}.${key}`] = value;
  });
  await updateDoc(taskListRef, updateData);
}

export async function deleteTask(taskListId: string, taskId: string) {
  const now = Date.now();
  const taskListRef = doc(db, "taskLists", taskListId);
  await updateDoc(taskListRef, {
    [`tasks.${taskId}`]: deleteField(),
    updatedAt: now,
  });
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

  const { newOrder, needsReindexing } = calculateDragDropOrder(
    tasks.map((t) => ({ id: t.id, order: t.order })),
    draggedTaskId,
    targetTaskId,
  );

  const now = Date.now();

  if (needsReindexing) {
    const reindexedTasks = reindexOrders(tasks);
    await runTransaction(db, async (transaction) => {
      const taskListRef = doc(db, "taskLists", taskListId);
      const updateData: Record<string, unknown> = { updatedAt: now };
      reindexedTasks.forEach((task) => {
        updateData[`tasks.${task.id}.order`] = task.order;
      });
      transaction.update(taskListRef, updateData);
    });
  } else {
    await runTransaction(db, async (transaction) => {
      const taskListRef = doc(db, "taskLists", taskListId);
      transaction.update(taskListRef, {
        [`tasks.${draggedTaskId}.order`]: newOrder,
        updatedAt: now,
      });
    });
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

  let shareCode = "";
  let isUnique = false;

  while (!isUnique) {
    shareCode = generateRandomShareCode();
    isUnique = await isShareCodeUnique(shareCode);
  }

  const now = Date.now();
  await updateDoc(doc(db, "taskLists", taskListId), {
    shareCode,
    updatedAt: now,
  });

  return shareCode;
}

export async function removeShareCode(taskListId: string): Promise<void> {
  const data = getData();

  if (!data.taskLists[taskListId]) {
    throw new Error("Task list not found");
  }

  const now = Date.now();
  await updateDoc(doc(db, "taskLists", taskListId), {
    shareCode: null,
    updatedAt: now,
  });
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

  await updateDoc(doc(db, "taskListOrder", uid), {
    [taskListId]: { order: newOrder },
    updatedAt: now,
  });
}
