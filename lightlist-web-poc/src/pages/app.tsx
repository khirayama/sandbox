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
import { AppState, TaskList } from "@/lib/types";
import { signOut, deleteAccount } from "@/lib/mutations/auth";
import { createTaskList, updateTaskListOrder } from "@/lib/mutations/app";
import { Spinner } from "@/components/Spinner";

interface SortableTaskListCardProps {
  taskList: TaskList;
  onNavigate: (taskListId: string) => void;
  dragHintLabel: string;
}

function SortableTaskListCard({
  taskList,
  onNavigate,
  dragHintLabel,
}: SortableTaskListCardProps) {
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
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        borderTop: `4px solid ${taskList.background || "#ffffff"}`,
        ...style,
      }}
    >
      <div className="flex items-center gap-2 p-4">
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
          onClick={() => onNavigate(taskList.id)}
          className="flex-1 text-left p-2 hover:bg-gray-50 transition-colors rounded"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-1 truncate">
            {taskList.name}
          </h3>
          <p className="text-sm text-gray-500">
            {taskList.tasks.length}{" "}
            {taskList.tasks.length === 1 ? "task" : "tasks"}
          </p>
        </button>
      </div>
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [createListInput, setCreateListInput] = useState("");
  const [creatingList, setCreatingList] = useState(false);

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

    // Set initial state
    setState(appStore.getState());

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
    };
  }, [router]);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await signOut();
      router.push("/");
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteAccount();
      router.push("/");
    } catch (err: any) {
      setError(err.message || t("auth.error.general"));
      setLoading(false);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const draggedTaskListId = active.id as string;
      const targetTaskListId = over.id as string;

      setError(null);
      try {
        // 浮動小数 order を使用：ドラッグされた TaskList 1件のみ更新
        await updateTaskListOrder(draggedTaskListId, targetTaskListId);
      } catch (err: any) {
        setError(err.message || t("app.error"));
      }
    }
  };

  const isLoading = !state || !state.user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t("app.title")}</h1>
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

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!state.taskLists || state.taskLists.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
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
        ) : (
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={state.taskLists.map((t) => t.id)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {state.taskLists.map((taskList) => (
                    <SortableTaskListCard
                      key={taskList.id}
                      taskList={taskList}
                      onNavigate={(taskListId) =>
                        router.push(`/tasklists/${taskListId}`)
                      }
                      dragHintLabel={t("app.dragHint")}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

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

      {/* Create Task List Modal */}
      {showCreateListForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
