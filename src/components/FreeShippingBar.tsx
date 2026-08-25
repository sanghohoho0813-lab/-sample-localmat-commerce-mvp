"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/data/etc";
import { formatWon } from "@/lib/format";

export default function FreeShippingBar({ itemsTotal }: { itemsTotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - itemsTotal);
  const percent = Math.min(100, Math.round((itemsTotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="rounded-card bg-tangerine-50 px-4 py-3.5">
      <p className="text-[13px] font-semibold text-bark-700">
        {remaining > 0 ? (
          <>
            무료배송까지 <span className="text-tangerine-600">{formatWon(remaining)}</span> 남았어요!
          </>
        ) : (
          <span className="text-leaf-700">무료배송 조건을 채웠어요! 🎉</span>
        )}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-pill bg-white">
          <div
            className="h-full rounded-pill bg-gradient-to-r from-tangerine-400 to-tangerine-500 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-[11px] font-medium text-bark-400 tabular-nums">
          {formatWon(Math.min(itemsTotal, FREE_SHIPPING_THRESHOLD))} / {formatWon(FREE_SHIPPING_THRESHOLD)}
        </span>
      </div>
    </div>
  );
}
