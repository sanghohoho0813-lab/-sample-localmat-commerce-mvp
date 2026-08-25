"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const label = size === "sm" ? "w-8 text-sm" : "w-10 text-base";
  return (
    <div className="inline-flex items-center rounded-xl border border-bark-200 bg-white">
      <button
        type="button"
        aria-label="수량 줄이기"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`flex ${btn} items-center justify-center rounded-l-xl text-bark-600 transition-colors duration-150 hover:bg-cream-100 disabled:text-bark-200 tap-highlight-none`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={`${label} text-center font-bold text-bark-800 tabular-nums`}>{value}</span>
      <button
        type="button"
        aria-label="수량 늘리기"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`flex ${btn} items-center justify-center rounded-r-xl text-bark-600 transition-colors duration-150 hover:bg-cream-100 disabled:text-bark-200 tap-highlight-none`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
