"use client";

interface Props {
  onDelete: () => void;
  onSkip: () => void;
  disabled: boolean;
}

export default function Controls({ onDelete, onSkip, disabled }: Props) {
  return (
    <div className="flex justify-center gap-4 mt-5">
      <button
        onClick={onDelete}
        disabled={disabled}
        className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        🗑️ Delete (D)
      </button>
      <button
        onClick={onSkip}
        disabled={disabled}
        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ⏭️ Skip (S)
      </button>
    </div>
  );
}

