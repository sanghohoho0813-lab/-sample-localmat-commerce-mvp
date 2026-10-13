"use client";

import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore, useToastStore } from "@/lib/store";

/** 목록 안에서 바로 담기 — 옵션이 있으면 기본 옵션으로 담고, 결과를 알려 줍니다. */
export default function QuickAddButton({ product, className = "" }: { product: Product; className?: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  if (product.stock === 0) return null;
  return (
    <button
      type="button"
      aria-label={`${product.name} 장바구니 담기`}
      onClick={() => {
        const { quantity, capped } = addItem(product.id, 1, product.options?.[0]?.label);
        showToast(capped ? `재고가 ${quantity}개뿐이라 더 담을 수 없어요.` : "장바구니에 담았어요.", {
          label: "보러가기",
          href: "/cart",
        });
      }}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bark-200 bg-white text-leaf-700 transition-colors hover:border-leaf-600 hover:bg-leaf-700 hover:text-white active:scale-95 focus-ring ${className}`}
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}
