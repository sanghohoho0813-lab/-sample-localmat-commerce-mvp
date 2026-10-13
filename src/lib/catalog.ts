import type { Product } from "@/lib/types";
import { getFarm } from "@/lib/data/farms";
import { getProduct } from "@/lib/data/products";

/**
 * 원산지·생산자 한 줄 — "충남 논산"과 "논산 딸기 농장"처럼 겹치는 말은 한 번만.
 * 농가 이름에 지역이 들어 있으면 농가 이름만, 아니면 "양평 · 행복한 닭 농장"
 */
export function originLabel(product: Pick<Product, "region" | "farmId">): string {
  const farm = getFarm(product.farmId);
  const city = product.region.split(" ").pop() ?? product.region;
  if (!farm) return product.region;
  return farm.name.includes(city) ? farm.name : `${city} · ${farm.name}`;
}

/** 진열 순서 — 살 수 있는 상품 먼저(품절·시즌 준비 중은 뒤로), 그 안에서는 원래 순서 유지 */
export function availableFirst<T extends Pick<Product, "stock">>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
}

export interface FarmGroup<T> {
  farmId: string;
  items: T[];
}

/**
 * 농가별로 묶기 — 농가마다 한 상자로 따로 출발하므로 장바구니·주문서·주문 내역에서 같은 단위로 보여 줍니다.
 * 처음 담은 순서를 지킵니다.
 */
export function groupByFarm<T extends { productId: string }>(items: readonly T[]): FarmGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const farmId = getProduct(item.productId)?.farmId ?? "unknown";
    groups.set(farmId, [...(groups.get(farmId) ?? []), item]);
  }
  return [...groups.entries()].map(([farmId, list]) => ({ farmId, items: list }));
}
