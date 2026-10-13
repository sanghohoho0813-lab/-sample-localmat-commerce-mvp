import type { Product } from "@/lib/types";
import { kstNow } from "@/lib/kst";

/** 지금(한국 시간) 몇 월인지 */
export function currentMonth(now: Date = new Date()): number {
  return kstNow(now).date.m;
}

/** 이번 달이 출하 시기인지 — 연중 상품(가공·건조·축산)은 '제철'로 치지 않습니다. */
export function isInSeason(product: Pick<Product, "season">, month: number): boolean {
  return product.season.includes(month);
}

export function isAvailable(product: Pick<Product, "stock">): boolean {
  return product.stock > 0;
}

/**
 * 출하 달을 사람이 읽는 범위로 — [10,11,12] → "10~12월", [11,12,1,2,3] → "11~3월", [] → "연중".
 * 해를 넘기는 범위도 이어진 하나로 읽습니다.
 */
export function seasonLabel(months: readonly number[]): string {
  if (months.length === 0 || months.length === 12) return "연중";
  const set = new Set(months);
  // 범위의 시작 = 앞 달이 빠진 달
  const starts = months.filter((m) => !set.has(m === 1 ? 12 : m - 1)).sort((a, b) => a - b);
  return starts
    .map((start) => {
      let end = start;
      while (set.has(end === 12 ? 1 : end + 1)) end = end === 12 ? 1 : end + 1;
      return start === end ? `${start}월` : `${start}~${end}월`;
    })
    .join(", ");
}
