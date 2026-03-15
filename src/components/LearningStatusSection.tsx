"use client";

import confetti from "canvas-confetti";
import { CheckCircle, XCircle, Save } from "lucide-react";

interface Props {
  isUnderstood: boolean | null;
  onToggle: (understood: boolean) => void;
  onSave: () => void;
  disabled?: boolean;
}

export default function LearningStatusSection({ isUnderstood, onToggle, onSave, disabled }: Props) {
  const handleToggleUnderstood = (value: boolean) => {
    onToggle(value);
    if (value) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="flex gap-4">
        <button
          onClick={() => handleToggleUnderstood(true)}
          disabled={disabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
            isUnderstood === true
              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
              : "border-gray-200 bg-white text-gray-400 hover:border-emerald-200 hover:text-emerald-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <CheckCircle className="w-5 h-5" />
          이해했어요
        </button>

        <button
          onClick={() => handleToggleUnderstood(false)}
          disabled={disabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
            isUnderstood === false
              ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
              : "border-gray-200 bg-white text-gray-400 hover:border-rose-200 hover:text-rose-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <XCircle className="w-5 h-5" />
          이해하지 못했어요
        </button>
      </div>

      <button
        onClick={onSave}
        disabled={disabled || isUnderstood === null}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-10 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md active:translate-y-0 disabled:shadow-none"
      >
        <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(100%)]">
          <div className="relative h-full w-8 bg-white/20" />
        </span>
        <Save className="w-5 h-5 mr-2" />
        <span>저장하기</span>
      </button>
    </div>
  );
}
