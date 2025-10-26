"use client";

import { useState } from "react";

interface Props {
  currentIndex: number;
  totalContacts: number;
  onPrevious: () => void;
  onNext: () => void;
  onJump: (target: number) => void;
  disabled: boolean;
  loadedCount?: number; // Number of contacts actually loaded
}

export default function Navigation({
  currentIndex,
  totalContacts,
  onPrevious,
  onNext,
  onJump,
  disabled,
  loadedCount,
}: Props) {
  const [jumpValue, setJumpValue] = useState("");
  
  // Use loadedCount for navigation limits if provided
  const effectiveLimit = loadedCount !== undefined ? loadedCount : totalContacts;

  const handleJump = () => {
    const target = parseInt(jumpValue);
    if (!isNaN(target)) {
      onJump(target);
      setJumpValue("");
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 mb-5">
      <button
        onClick={onPrevious}
        disabled={disabled || currentIndex <= 0}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold text-gray-700 transition-all active:scale-95 disabled:active:scale-100"
        title="Previous contact (←)"
      >
        ←
      </button>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
          Jump to:
        </span>
        <input
          type="number"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJump()}
          placeholder="#"
          min="1"
          max={totalContacts}
          disabled={disabled}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold"
        />
        <button
          onClick={handleJump}
          disabled={disabled}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100"
        >
          Go
        </button>
      </div>

      <button
        onClick={onNext}
        disabled={disabled || currentIndex >= effectiveLimit - 1}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold text-gray-700 transition-all active:scale-95 disabled:active:scale-100"
        title="Next contact (→)"
      >
        →
      </button>
    </div>
  );
}
