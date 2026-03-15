"use client";

import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";

export default function ConfettiButton({ onConfettiComplete }: { onConfettiComplete?: () => void }) {
  const handleConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    });

    if (onConfettiComplete) {
      onConfettiComplete();
    }
  };

  return (
    <button
      onClick={handleConfetti}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-8 font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0"
    >
      <span className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-13deg)_translateX(100%)]">
        <div className="relative h-full w-8 bg-white/30" />
      </span>
      <CheckCircle className="w-5 h-5 mr-2" />
      <span className="font-bold">이해했어요! (저장)</span>
    </button>
  );
}
