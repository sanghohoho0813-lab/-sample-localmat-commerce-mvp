/**
 * 가격 계산 — 장바구니·주문서·주문 저장이 모두 이 모듈 하나로 금액을 냅니다.
 * UI와 저장소(zustand)에 의존하지 않는 순수 함수라 단위 테스트로 검증합니다(src/lib/pricing.test.ts).
 */
import type { CartItem, Coupon } from "@/lib/types";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, coupons as allCoupons } from "@/lib/data/etc";
import { getProduct } from "@/lib/data/products";

/** 옵션 추가금을 포함한 1개 가격. 판매가 끝난(목록에 없는) 상품은 0원 */
export function unitPrice(item: Pick<CartItem, "productId" | "optionLabel">): number {
  const product = getProduct(item.productId);
  if (!product) return 0;
  const extra = product.options?.find((o) => o.label === item.optionLabel)?.extraPrice ?? 0;
  return product.price + extra;
}

export function itemsTotalOf(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
}

/** 빈 주문은 배송비 없음, 기준 금액 이상이면 무료 */
export function shippingFeeFor(itemsTotal: number): number {
  return itemsTotal === 0 || itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** 무료배송까지 남은 금액(0 = 이미 무료) */
export function freeShippingGap(itemsTotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - itemsTotal);
}

/** 이 주문 금액에서 쿠폰으로 깎이는 금액 — 조건이 안 맞으면 0. 할인은 상품 금액을 넘지 않습니다. */
export function couponDiscountFor(coupon: Coupon, itemsTotal: number): number {
  if (itemsTotal <= 0 || itemsTotal < coupon.minOrder) return 0;
  const raw =
    coupon.discountType === "percent" ? Math.floor((itemsTotal * coupon.value) / 100) : coupon.value;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return Math.min(capped, itemsTotal);
}

export interface CouponChoice {
  coupon: Coupon;
  discount: number;
}

export interface CouponOptions {
  /** 지금 쓸 수 있는 쿠폰 — 할인 금액이 큰 순 */
  usable: CouponChoice[];
  unusableCount: number;
  /** 아직 못 쓰는 쿠폰 중 가장 가까운 조건까지 남은 금액(없으면 null) */
  nextGap: number | null;
}

export function couponOptions(itemsTotal: number, coupons: readonly Coupon[] = allCoupons): CouponOptions {
  const usable = coupons
    .map((coupon) => ({ coupon, discount: couponDiscountFor(coupon, itemsTotal) }))
    .filter((c) => c.discount > 0)
    .sort((a, b) => b.discount - a.discount);
  const gaps = coupons.filter((c) => itemsTotal < c.minOrder).map((c) => c.minOrder - itemsTotal);
  return {
    usable,
    unusableCount: coupons.length - usable.length,
    nextGap: gaps.length > 0 ? Math.min(...gaps) : null,
  };
}

export interface OrderSummary {
  itemsTotal: number;
  shippingFee: number;
  couponDiscount: number;
  total: number;
}

/**
 * 주문 금액 요약.
 * @param couponId 고른 쿠폰 — 쓸 수 없는 쿠폰이면 할인 0으로 계산합니다(금액이 바뀌어 조건이 깨진 경우 등).
 */
export function summarize(
  items: readonly CartItem[],
  couponId: string | null = null,
  coupons: readonly Coupon[] = allCoupons
): OrderSummary {
  const itemsTotal = itemsTotalOf(items);
  const shippingFee = shippingFeeFor(itemsTotal);
  const coupon = coupons.find((c) => c.id === couponId);
  const couponDiscount = coupon ? couponDiscountFor(coupon, itemsTotal) : 0;
  return { itemsTotal, shippingFee, couponDiscount, total: itemsTotal + shippingFee - couponDiscount };
}
