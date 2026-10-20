"use client";

import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useQuickAdd } from "@/lib/useQuickAdd";

/** 목록 안에서 바로 담기 — 옵션이 있으면 기본 옵션으로 담고, 담은 직후 잠깐 체크로 바뀝니다. */
export default function QuickAddButton({ product, className = "" }: { product: Product; className?: string }) {
  const { add, added } = useQuickAdd(product);
  if (product.stock === 0) return null;
  return (
    <button
      type="button"
      aria-label={`${product.name} 장바구니 담기`}
      onClick={add}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors active:scale-95 focus-ring ${
        added
          ? "border-leaf-700 bg-leaf-700 text-white"
          : "border-bark-200 bg-white text-leaf-700 hover:border-leaf-600 hover:bg-leaf-700 hover:text-white"
      } ${className}`}
    >
      {added ? <Check className="h-5 w-5 animate-pop" strokeWidth={2.6} /> : <Plus className="h-5 w-5" />}
    </button>
  );
}
