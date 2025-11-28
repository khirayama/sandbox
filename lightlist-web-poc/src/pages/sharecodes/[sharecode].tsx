"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { auth } from "@/sdk/firebase";
import { TaskListStore, TaskListStoreTask } from "@/sdk/types";
import {
  fetchTaskListByShareCode,
  addTask,
  updateTask,
  deleteTask,
  updateTasksOrder,
  addSharedTaskListToOrder,
} from "@/sdk/mutations/app";
import { Spinner } from "@/components/Spinner";
import { SortableTaskItem } from "@/components/SortableTaskItem";

export default function ShareCodePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sharecode } = router.query;

  const [taskList, setTaskList] = useState<TaskListStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<typeof auth.currentUser>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addTaskError, setAddTaskError] = useState<string | null>(null);
  const [addToOrderLoading, setAddToOrderLoading] = useState(false);
  const [addToOrderError, setAddToOrderError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!sharecode || typeof sharecode !== "string") return;

    const loadTaskList = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTaskListByShareCode(sharecode);
        if (!data) {
          setError(t("pages.sharecode.notFound"));
          setTaskList(null);
        } else {
          setTaskList(data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("pages.sharecode.error"),
        );
        setTaskList(null);
      } finally {
        setLoading(false);
      }
    };

    loadTaskList();
  }, [sharecode, t]);

  const handleAddTask = async () => {
    if (!newTaskText.trim() || !taskList) return;

    try {
      setIsAddingTask(true);
      setAddTaskError(null);
      await addTask(taskList.id, newTaskText);
      setNewTaskText("");

      const updatedTaskList = await fetchTaskListByShareCode(
        sharecode as string,
      );
      if (updatedTaskList) {
        setTaskList(updatedTaskList);
      }
    } catch (err) {
      setAddTaskError(
        err instanceof Error ? err.message : t("pages.sharecode.addTaskError"),
      );
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleEditStart = (task: TaskListStoreTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleEditEnd = async (task: TaskListStoreTask) => {
    if (!taskList) return;

    if (editingText.trim() === "") {
      setEditingTaskId(null);
      return;
    }

    if (editingText === task.text) {
      setEditingTaskId(null);
      return;
    }

    try {
      await updateTask(taskList.id, task.id, { text: editingText });
      const updatedTaskList = await fetchTaskListByShareCode(
        sharecode as string,
      );
      if (updatedTaskList) {
        setTaskList(updatedTaskList);
      }
      setEditingTaskId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("pages.sharecode.updateError"),
      );
    }
  };

  const handleToggleTask = async (task: TaskListStoreTask) => {
    if (!taskList) return;

    try {
      await updateTask(taskList.id, task.id, {
        completed: !task.completed,
      });
      const updatedTaskList = await fetchTaskListByShareCode(
        sharecode as string,
      );
      if (updatedTaskList) {
        setTaskList(updatedTaskList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("pages.sharecode.updateError"),
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskList) return;

    try {
      await deleteTask(taskList.id, taskId);
      const updatedTaskList = await fetchTaskListByShareCode(
        sharecode as string,
      );
      if (updatedTaskList) {
        setTaskList(updatedTaskList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("pages.sharecode.deleteError"),
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!taskList) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      await updateTasksOrder(
        taskList.id,
        active.id as string,
        over.id as string,
      );
      const updatedTaskList = await fetchTaskListByShareCode(
        sharecode as string,
      );
      if (updatedTaskList) {
        setTaskList(updatedTaskList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("pages.sharecode.reorderError"),
      );
    }
  };

  const handleAddToOrder = async () => {
    if (!taskList || !user) return;

    try {
      setAddToOrderLoading(true);
      setAddToOrderError(null);
      await addSharedTaskListToOrder(taskList.id);
      router.push("/app");
    } catch (err) {
      setAddToOrderError(
        err instanceof Error
          ? err.message
          : t("pages.sharecode.addToOrderError"),
      );
    } finally {
      setAddToOrderLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!taskList) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t("pages.sharecode.notFound")}</p>
        </div>
      </div>
    );
  }

  const tasks = Object.values(taskList.tasks || {}).sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: taskList.background }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← {t("common.back")}
          </button>
          {user && (
            <button
              onClick={handleAddToOrder}
              disabled={addToOrderLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {addToOrderLoading
                ? t("common.loading")
                : t("pages.sharecode.addToOrder")}
            </button>
          )}
        </div>

        {addToOrderError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{addToOrderError}</p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8">{taskList.name}</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
              placeholder={t("pages.tasklist.addTaskPlaceholder")}
              className="flex-1 px-4 py-2 border rounded"
              disabled={isAddingTask}
            />
            <button
              onClick={handleAddTask}
              disabled={isAddingTask || !newTaskText.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {t("common.add")}
            </button>
          </div>

          {addTaskError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{addTaskError}</p>
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t("pages.tasklist.noTasks")}
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      isEditing={editingTaskId === task.id}
                      editingText={editingText}
                      onEditingTextChange={setEditingText}
                      onEditStart={handleEditStart}
                      onEditEnd={handleEditEnd}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                      deleteLabel={t("common.delete")}
                      dragHintLabel={t("pages.tasklist.dragHint")}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
