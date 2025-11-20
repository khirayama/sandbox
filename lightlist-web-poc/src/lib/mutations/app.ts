import {
  doc,
  updateDoc,
  deleteField,
  collection,
  writeBatch,
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

export async function updateSettings(settings: Partial<Settings>) {
  const data = getData();

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

  commit();

  try {
    const updates: Record<string, unknown> = {
      ...settings,
      updatedAt: now,
    };
    await updateDoc(doc(db, "settings", uid), updates);
  } catch (error) {
    throw error;
  }
}

export async function updateTaskListOrder(
  taskListOrder: Omit<TaskListOrderStore, "createdAt" | "updatedAt">
) {
  const data = getData();

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

  commit();

  try {
    const updates: Record<string, unknown> = {
      ...taskListOrder,
      updatedAt: now,
    };
    await updateDoc(doc(db, "taskListOrder", uid), updates);
  } catch (error) {
    throw error;
  }
}

export async function createTaskList(
  name: string,
  background: string = "#ffffff"
) {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const taskListId = doc(collection(db, "taskLists")).id;

  const maxOrder =
    Object.values(data.taskListOrder || {})
      .filter(
        (item) => typeof item === "object" && item !== null && "order" in item
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

  commit();

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
}

export async function updateTaskList(
  taskListId: string,
  updates: Partial<Omit<TaskListStore, "id" | "createdAt" | "updatedAt">>
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
  date: string = ""
) {
  const data = getData();

  const taskId = doc(collection(db, "taskLists")).id;

  const taskListData: TaskListStore = data.taskLists[taskListId];
  if (!taskListData) throw new Error("Task list not found");

  const maxOrder =
    Object.values(taskListData.tasks)
      .map((task: TaskListStoreTask) => task.order)
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

  commit();

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
}

export async function updateTask(
  taskListId: string,
  taskId: string,
  updates: Partial<Task>
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
