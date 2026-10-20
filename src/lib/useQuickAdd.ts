"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { itemLabel } from "@/lib/format";
import { useCartStore, useToastStore } from "@/lib/store";

/** 담기 버튼이 잠깐 체크로 바뀌는 시간 */
const ADDED_MS = 1400;

/**
 * 목록·카드에서 바로 담기 — 옵션이 있으면 기본 옵션으로 하나 담고,
 * 사진이 들어간 알림으로 무엇을 담았는지 보여 준 뒤 버튼을 잠깐 '담김'으로 바꿉니다.
 */
export function useQuickAdd(product: Product) {
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const add = useCallback(() => {
    const option = product.options?.[0]?.label;
    const { quantity, capped, soldOut } = addItem(product.id, 1, option);
    const label = itemLabel(product.name, product.unit, option);
    const title = label.option ? `${label.title} · ${label.option}` : label.title;
    if (soldOut) {
      showToast("지금은 담을 수 없는 상품이에요.", undefined, { tone: "info", thumb: product.image, detail: title });
      return;
    }
    showToast(
      capped
        ? `재고가 ${quantity}개뿐이라 더 담을 수 없어요.`
        : quantity > 1
          ? `장바구니에 담았어요 (총 ${quantity}개)`
          : "장바구니에 담았어요.",
      { label: "보러가기", href: "/cart" },
      { thumb: product.image, detail: title, tone: capped ? "info" : "success" }
    );
    if (capped) return;
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ADDED_MS);
  }, [addItem, product, showToast]);

  return { add, added };
}
