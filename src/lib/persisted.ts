/**
 * 브라우저 저장소(localStorage)에서 읽은 값 검증.
 *
 * 저장값은 이전 버전 앱이 남긴 것일 수도, 사용자가 개발자 도구로 고친 것일 수도 있습니다.
 * 그대로 믿으면 판매가 끝난 상품이 장바구니에 남아 0원으로 결제되거나, 재고보다 많은 수량이 주문됩니다.
 * 그래서 store가 저장값을 화면에 올리기 전에 이 함수들로 한 번 걸러 냅니다(src/lib/persisted.test.ts).
 */
import type { CartItem, Order, Review } from "@/lib/types";
import { getProduct } from "@/lib/data/products";

export const HARD_MAX_QUANTITY = 99;

/** 한 상품을 장바구니에 담을 수 있는 최대 수량 — 재고를 넘지 않습니다. */
export function maxQuantityFor(productId: string): number {
  const stock = getProduct(productId)?.stock ?? HARD_MAX_QUANTITY;
  return Math.max(1, Math.min(stock, HARD_MAX_QUANTITY));
}

export function cartKey(productId: string, optionLabel?: string): string {
  return `${productId}__${optionLabel ?? ""}`;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * 장바구니 항목 정리
 * - 없는 상품·없는 옵션은 버립니다(옵션이 있는 상품인데 옵션이 비면 첫 옵션으로 맞춥니다).
 * - 수량은 1 ~ 재고 사이 정수로 맞춥니다.
 * - 같은 상품·옵션이 두 번 있으면 하나로 합칩니다.
 */
export function sanitizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, CartItem>();
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.productId !== "string") continue;
    const product = getProduct(entry.productId);
    if (!product) continue;

    let optionLabel = typeof entry.optionLabel === "string" ? entry.optionLabel : undefined;
    if (product.options?.length) {
      if (!optionLabel) optionLabel = product.options[0].label;
      if (!product.options.some((o) => o.label === optionLabel)) continue;
    } else {
      optionLabel = undefined;
    }

    const quantity = Math.floor(Number(entry.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;

    const key = cartKey(product.id, optionLabel);
    const previous = merged.get(key)?.quantity ?? 0;
    merged.set(key, {
      productId: product.id,
      optionLabel,
      quantity: Math.min(previous + quantity, maxQuantityFor(product.id)),
    });
  }
  return [...merged.values()];
}

/** 찜·최근 본 상품 — 있는 상품 id만, 중복 없이 */
export function sanitizeProductIds(raw: unknown, limit = Infinity): string[] {
  if (!Array.isArray(raw)) return [];
  const ids = raw.filter((id): id is string => typeof id === "string" && !!getProduct(id));
  return [...new Set(ids)].slice(0, limit);
}

/** 주문 — 화면이 기대는 최소 모양(id, 상품 목록, 금액)을 갖춘 것만 */
export function sanitizeOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (o): o is Order =>
      isRecord(o) &&
      typeof o.id === "string" &&
      typeof o.createdAt === "string" &&
      Array.isArray(o.items) &&
      typeof o.totalAmount === "number"
  );
}

/** 내가 쓴 리뷰 — 별점 1~5, 내용이 있는 것만 */
export function sanitizeReviews<T extends Review>(raw: unknown): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is T =>
      isRecord(r) &&
      typeof r.id === "string" &&
      typeof r.productId === "string" &&
      typeof r.content === "string" &&
      typeof r.rating === "number" &&
      r.rating >= 1 &&
      r.rating <= 5
  );
}
