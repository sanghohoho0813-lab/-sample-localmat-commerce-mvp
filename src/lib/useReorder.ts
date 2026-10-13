"use client";

import { useCallback } from "react";
import type { OrderItem } from "@/lib/types";
import { useCartStore, useToastStore } from "@/lib/store";

/**
 * 지난 주문 다시 담기 — 품절·시즌 준비 중인 상품은 빼고, 재고보다 많으면 재고만큼만 담은 뒤 결과를 그대로 알려 줍니다.
 */
export function useReorder() {
  const reorder = useCartStore((s) => s.reorder);
  const showToast = useToastStore((s) => s.show);
  return useCallback(
    (items: readonly OrderItem[]) => {
      const result = reorder(items.map((i) => ({ productId: i.productId, optionLabel: i.optionLabel, quantity: i.quantity })));
      const parts: string[] = [];
      if (result.added > 0) parts.push(`${result.added}개 상품을 다시 담았어요`);
      if (result.soldOut.length > 0) parts.push(`${result.soldOut.join(", ")}은(는) 시즌 준비 중이라 빠졌어요`);
      if (result.capped.length > 0) parts.push("일부는 재고만큼만 담았어요");
      showToast(parts.join(" · ") || "담을 수 있는 상품이 없어요.", result.added > 0 ? { label: "보러가기", href: "/cart" } : undefined);
    },
    [reorder, showToast]
  );
}
