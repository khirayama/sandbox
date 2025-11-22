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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { auth } from "@/lib/firebase";
import { appStore } from "@/lib/store";
import { AppState, Task, TaskList } from "@/lib/types";
import {
  updateTask,
  deleteTask,
  addTask,
  updateTaskList,
  deleteTaskList,
  updateTasksOrder,
} from "@/lib/mutations/app";
import { Spinner } from "@/components/Spinner";

interface SortableTaskItemProps {
  task: Task;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onEditStart: (task: Task) => void;
  onEditEnd: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
  deleteLabel: string;
  dragHintLabel: string;
}

function SortableTaskItem({
  task,
  isEditing,
  editingText,
  onEditingTextChange,
  onEditStart,
  onEditEnd,
  onToggle,
  onDelete,
  deleteLabel,
  dragHintLabel,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex items-center gap-3 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        title={dragHintLabel}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      </button>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="w-5 h-5 rounded cursor-pointer"
      />

      {isEditing ? (
        <input
          type="text"
          value={editingText}
          onChange={(e) => onEditingTextChange(e.target.value)}
          onBlur={() => onEditEnd(task)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEditEnd(task);
            } else if (e.key === "Escape") {
              onEditingTextChange(task.text);
            }
          }}
          autoFocus
          className="flex-1 px-3 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <span
          className={`flex-1 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
          onClick={() => onEditStart(task)}
        >
          {task.text}
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
      >
        {deleteLabel}
      </button>
    </div>
  );
}

export default function TaskListPage() {
  const router = useRouter();
  const { id: taskListId } = router.query;
  const { t } = useTranslation();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListName, setEditListName] = useState("");
  const [editListColor, setEditListColor] = useState("");
  const [editingListName, setEditingListName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingList, setDeletingList] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Check authentication and subscribe to store
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    const unsubscribeStore = appStore.subscribe((newState) => {
      setState(newState);
    });

    setState(appStore.getState());

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
    };
  }, [router]);

  const taskList = state?.taskLists?.find((tl) => tl.id === taskListId) as
    | TaskList
    | undefined;

  const isLoading = !state || !state.user || !taskListId || !taskList;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedTaskId = active.id as string;
      const targetTaskId = over.id as string;

      setError(null);
      try {
        // 浮動小数 order を使用：ドラッグされたタスク1件のみ更新
        await updateTasksOrder(
          taskListId as string,
          draggedTaskId,
          targetTaskId,
        );
      } catch (err: any) {
        setError(err.message || t("common.error"));
      }
    }
  };

  const handleToggleTask = async (task: Task) => {
    setError(null);
    try {
      await updateTask(taskListId as string, task.id, {
        completed: !task.completed,
      });
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    setError(null);

    try {
      await addTask(taskListId as string, newTaskText.trim());
      setNewTaskText("");
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditTask = async (task: Task) => {
    if (!editingTaskText.trim() || editingTaskText === task.text) {
      setEditingTaskId(null);
      return;
    }

    setError(null);
    try {
      await updateTask(taskListId as string, task.id, {
        text: editingTaskText.trim(),
      });
      setEditingTaskId(null);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setError(null);
    try {
      await deleteTask(taskListId as string, taskId);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditListName = async () => {
    if (!editListName.trim() || editListName === taskList.name) {
      setEditingListName(false);
      return;
    }

    setError(null);
    try {
      await updateTaskList(taskListId as string, { name: editListName.trim() });
      setEditingListName(false);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditListColor = async (color: string) => {
    setError(null);
    try {
      await updateTaskList(taskListId as string, { background: color });
      setShowEditListModal(false);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleDeleteList = async () => {
    setDeletingList(true);
    setError(null);

    try {
      await deleteTaskList(taskListId as string);
      router.push("/app");
    } catch (err: any) {
      setError(err.message || t("common.error"));
      setDeletingList(false);
    }
  };

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#6C5CE7",
    "#A29BFE",
    "#74B9FF",
    "#81ECEC",
    "#55EFC4",
    "#FD79A8",
    "#FDCB6E",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/app")}
            className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            {t("common.back")}
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              {editingListName ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editListName}
                    onChange={(e) => setEditListName(e.target.value)}
                    onBlur={() => handleEditListName()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEditListName();
                      }
                    }}
                    autoFocus
                    className="text-2xl font-bold text-gray-800 px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <h1
                  className="text-2xl font-bold text-gray-800 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                  onClick={() => {
                    setEditListName(taskList.name);
                    setEditingListName(true);
                  }}
                >
                  {taskList.name}
                </h1>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {taskList.tasks.length} {t("taskList.taskCount")}
              </p>
            </div>

            <button
              onClick={() => {
                setEditListColor(taskList.background || "#ffffff");
                setShowEditListModal(true);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {t("taskList.editColor")}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tasks List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={taskList.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 mb-6">
              {taskList.tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  isEditing={editingTaskId === task.id}
                  editingText={editingTaskText}
                  onEditingTextChange={setEditingTaskText}
                  onEditStart={(t) => {
                    setEditingTaskId(t.id);
                    setEditingTaskText(t.text);
                  }}
                  onEditEnd={handleEditTask}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  deleteLabel={t("common.delete")}
                  dragHintLabel={t("taskList.dragHint")}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Task Form */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
              }}
              placeholder={t("taskList.addTaskPlaceholder")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {t("taskList.addTask")}
            </button>
          </div>
        </div>

        {/* Delete List Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          {t("taskList.deleteList")}
        </button>
      </div>

      {/* Edit Color Modal */}
      {showEditListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t("taskList.selectColor")}
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleEditListColor(color)}
                  className="w-12 h-12 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      editListColor === color ? "#000" : "transparent",
                  }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => setShowEditListModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {t("taskList.deleteConfirm")}
            </h2>
            <p className="text-sm text-gray-600 mb-6">{taskList.name}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingList}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDeleteList}
                disabled={deletingList}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {deletingList ? t("common.deleting") : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
