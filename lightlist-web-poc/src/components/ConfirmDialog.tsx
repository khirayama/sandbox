export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  additionalInfo?: string;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
  disabled?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  additionalInfo,
  confirmText,
  cancelText,
  isDestructive = false,
  disabled = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {additionalInfo && (
          <p className="text-sm text-gray-600 mb-6 font-medium">
            {additionalInfo}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
