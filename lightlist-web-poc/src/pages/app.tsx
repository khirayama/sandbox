"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useSwipeable } from "react-swipeable";
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

import { auth } from "@/sdk/firebase";
import { appStore } from "@/sdk/store";
import { AppState, TaskList, Task } from "@/sdk/types";
import { signOut, deleteAccount } from "@/sdk/mutations/auth";
import {
  createTaskList,
  updateTaskListOrder,
  updateTask,
  deleteTask,
  addTask,
  updateTaskList,
  deleteTaskList,
  updateTasksOrder,
  generateShareCode,
  removeShareCode,
} from "@/sdk/mutations/app";
import { Spinner } from "@/components/Spinner";
import { SortableTaskItem } from "@/components/SortableTaskItem";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface SortableTaskListItemProps {
  taskList: TaskList;
  isSelected: boolean;
  onSelect: (taskListId: string) => void;
  dragHintLabel: string;
  taskCountLabel: string;
}

function SortableTaskListItem({
  taskList,
  isSelected,
  onSelect,
  dragHintLabel,
  taskCountLabel,
}: SortableTaskListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: taskList.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg shadow hover:shadow-md transition-all
        ${isSelected ? "ring-2 ring-indigo-500" : ""}
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          title={dragHintLabel}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </button>

        <button
          onClick={() => onSelect(taskList.id)}
          className="flex-1 text-left p-2 hover:bg-gray-50 transition-colors rounded"
        >
          <div
            className="w-full h-1 rounded-full mb-2"
            style={{ backgroundColor: taskList.background || "#ffffff" }}
          />
          <h3 className="text-sm font-medium text-gray-800 truncate">
            {taskList.name}
          </h3>
          <p className="text-xs text-gray-500">
            {taskList.tasks.length} {taskCountLabel}
          </p>
        </button>
      </div>
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(
    null,
  );

  const [state, setState] = useState<AppState | null>(null);
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [generatingShareCode, setGeneratingShareCode] = useState(false);
  const [removingShareCode, setRemovingShareCode] = useState(false);
  const [shareCopySuccess, setShareCopySuccess] = useState(false);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [createListInput, setCreateListInput] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const sensorsList = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  useEffect(() => {
    if (state?.taskLists && state.taskLists.length > 0 && !selectedTaskListId) {
      setSelectedTaskListId(state.taskLists[0].id);
    }
  }, [state?.taskLists, selectedTaskListId]);

  const selectedTaskList = state?.taskLists?.find(
    (tl) => tl.id === selectedTaskListId,
  ) as TaskList | undefined;

  const isLoading = !state || !state.user;

  const swipeHandlersDrawer = useSwipeable({
    onSwipedLeft: () => setIsDrawerOpen(false),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const swipeHandlersMain = useSwipeable({
    onSwipedRight: () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsDrawerOpen(true);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const handleDragEndTaskList = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedTaskListId = active.id as string;
      const targetTaskListId = over.id as string;

      setError(null);
      try {
        await updateTaskListOrder(draggedTaskListId, targetTaskListId);
      } catch (err: any) {
        setError(err.message || t("common.error"));
      }
    }
  };

  const handleCreateList = async () => {
    if (!createListInput.trim()) return;

    setCreatingList(true);
    setError(null);

    try {
      await createTaskList(createListInput.trim());
      setCreateListInput("");
      setShowCreateListForm(false);
    } catch (err: any) {
      setError(err.message || t("app.error"));
      setCreatingList(false);
    }
  };

  const handleDragEndTask = async (event: DragEndEvent) => {
    if (!selectedTaskListId) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedTaskId = active.id as string;
      const targetTaskId = over.id as string;

      setError(null);
      try {
        await updateTasksOrder(selectedTaskListId, draggedTaskId, targetTaskId);
      } catch (err: any) {
        setError(err.message || t("common.error"));
      }
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!selectedTaskListId) return;

    setError(null);
    try {
      await updateTask(selectedTaskListId, task.id, {
        completed: !task.completed,
      });
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleAddTask = async () => {
    if (!selectedTaskListId || !newTaskText.trim()) return;

    setError(null);

    try {
      await addTask(selectedTaskListId, newTaskText.trim());
      setNewTaskText("");
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditTask = async (task: Task) => {
    if (!selectedTaskListId) return;

    if (!editingTaskText.trim() || editingTaskText === task.text) {
      setEditingTaskId(null);
      return;
    }

    setError(null);
    try {
      await updateTask(selectedTaskListId, task.id, {
        text: editingTaskText.trim(),
      });
      setEditingTaskId(null);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedTaskListId) return;

    setError(null);
    try {
      await deleteTask(selectedTaskListId, taskId);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditListName = async () => {
    if (!selectedTaskListId || !selectedTaskList) return;

    if (!editListName.trim() || editListName === selectedTaskList.name) {
      setEditingListName(false);
      return;
    }

    setError(null);
    try {
      await updateTaskList(selectedTaskListId, { name: editListName.trim() });
      setEditingListName(false);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleEditListColor = async (color: string) => {
    if (!selectedTaskListId) return;

    setError(null);
    try {
      await updateTaskList(selectedTaskListId, { background: color });
      setShowEditListModal(false);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    }
  };

  const handleDeleteList = async () => {
    if (!selectedTaskListId) return;

    setDeletingList(true);
    setError(null);

    try {
      await deleteTaskList(selectedTaskListId);

      const remainingLists = state?.taskLists?.filter(
        (tl) => tl.id !== selectedTaskListId,
      );
      if (remainingLists && remainingLists.length > 0) {
        setSelectedTaskListId(remainingLists[0].id);
      } else {
        setSelectedTaskListId(null);
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
      setDeletingList(false);
    }
  };

  const handleGenerateShareCode = async () => {
    if (!selectedTaskListId) return;

    setGeneratingShareCode(true);
    setError(null);

    try {
      const code = await generateShareCode(selectedTaskListId);
      setShareCode(code);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setGeneratingShareCode(false);
    }
  };

  const handleRemoveShareCode = async () => {
    if (!selectedTaskListId) return;

    setRemovingShareCode(true);
    setError(null);

    try {
      await removeShareCode(selectedTaskListId);
      setShareCode(null);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setRemovingShareCode(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareCode) return;

    const shareUrl = `${window.location.origin}/sharecodes/${shareCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopySuccess(true);
      setTimeout(() => setShareCopySuccess(false), 2000);
    } catch (err) {
      setError(t("common.error"));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        {...swipeHandlersDrawer}
        className={`
          fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-none md:transform-none
          flex flex-col overflow-hidden
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">{t("app.title")}</h1>
          <button
            onClick={() => router.push("/settings")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Settings"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {state?.taskLists && state.taskLists.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <DndContext
                sensors={sensorsList}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndTaskList}
              >
                <SortableContext items={state.taskLists.map((t) => t.id)}>
                  <div className="space-y-2">
                    {state.taskLists.map((taskList) => (
                      <SortableTaskListItem
                        key={taskList.id}
                        taskList={taskList}
                        isSelected={taskList.id === selectedTaskListId}
                        onSelect={(taskListId) => {
                          setSelectedTaskListId(taskListId);
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 768
                          ) {
                            setIsDrawerOpen(false);
                          }
                        }}
                        dragHintLabel={t("app.dragHint")}
                        taskCountLabel={t("taskList.taskCount")}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowCreateListForm(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("app.createNew")}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <p className="text-gray-600 mb-4 text-center">
              {t("app.emptyState")}
            </p>
            <button
              onClick={() => setShowCreateListForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("app.createNew")}
            </button>
          </div>
        )}
      </div>

      <div
        {...swipeHandlersMain}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {selectedTaskList ? (
          <>
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-4 flex items-center gap-4">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={t("app.openMenu")}
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div className="flex-1 flex items-start justify-between gap-4">
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
                          setEditListName(selectedTaskList.name);
                          setEditingListName(true);
                        }}
                      >
                        {selectedTaskList.name}
                      </h1>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedTaskList.tasks.length} {t("taskList.taskCount")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditListColor(
                          selectedTaskList.background || "#ffffff",
                        );
                        setShowEditListModal(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      {t("taskList.editColor")}
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(true);
                        setShareCode(selectedTaskList?.shareCode || null);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      {t("taskList.share")}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-8">
                <DndContext
                  sensors={sensorsList}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndTask}
                >
                  <SortableContext
                    items={selectedTaskList.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-6">
                      {selectedTaskList.tasks.map((task) => (
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

                <div className="bg-white rounded-lg shadow p-4 mb-8">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list="task-history-list"
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
                    <datalist id="task-history-list">
                      {selectedTaskList?.history?.map((text) => (
                        <option key={text} value={text} />
                      ))}
                    </datalist>
                    <button
                      onClick={handleAddTask}
                      disabled={!newTaskText.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      {t("taskList.addTask")}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  {t("taskList.deleteList")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t("app.emptyState")}</p>
              <button
                onClick={() => setShowCreateListForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("app.createNew")}
              </button>
            </div>
          </div>
        )}
      </div>

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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteList}
        title={t("taskList.deleteConfirm")}
        message={t("common.confirmDelete")}
        additionalInfo={selectedTaskList?.name}
        confirmText={deletingList ? t("common.deleting") : t("common.delete")}
        cancelText={t("common.cancel")}
        isDestructive={true}
        disabled={deletingList}
      />

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t("taskList.shareTitle")}
            </h2>

            {shareCode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t("taskList.shareCode")}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareCode}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {shareCopySuccess ? t("common.copied") : t("common.copy")}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleRemoveShareCode}
                  disabled={removingShareCode}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {removingShareCode
                    ? t("common.deleting")
                    : t("taskList.removeShare")}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {t("taskList.shareDescription")}
                </p>
                <button
                  onClick={handleGenerateShareCode}
                  disabled={generatingShareCode}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {generatingShareCode
                    ? t("common.loading")
                    : t("taskList.generateShare")}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {showCreateListForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {t("app.createTaskList")}
            </h2>
            <input
              type="text"
              value={createListInput}
              onChange={(e) => setCreateListInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creatingList) {
                  handleCreateList();
                }
              }}
              placeholder={t("app.taskListNamePlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={creatingList}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateListForm(false);
                  setCreateListInput("");
                }}
                disabled={creatingList}
                className="flex-1 bg-gray-300 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {t("app.cancel")}
              </button>
              <button
                onClick={handleCreateList}
                disabled={creatingList || !createListInput.trim()}
                className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creatingList ? t("app.creating") : t("app.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
