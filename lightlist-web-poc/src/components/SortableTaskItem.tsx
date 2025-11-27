import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface TaskForSortable {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
  order?: number;
}

export interface SortableTaskItemProps<
  T extends TaskForSortable = TaskForSortable,
> {
  task: T;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onEditStart: (task: T) => void;
  onEditEnd: (task: T) => void;
  onToggle: (task: T) => void;
  onDelete: (taskId: string) => void;
  deleteLabel: string;
  dragHintLabel: string;
}

export function SortableTaskItem<T extends TaskForSortable = TaskForSortable>({
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
}: SortableTaskItemProps<T>) {
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
            if (e.key === "Enter") onEditEnd(task);
            if (e.key === "Escape") {
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
