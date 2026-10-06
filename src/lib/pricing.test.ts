import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, coupons } from "@/lib/data/etc";
import type { Coupon } from "@/lib/types";
import {
  couponDiscountFor,
  couponOptions,
  freeShippingGap,
  itemsTotalOf,
  shippingFeeFor,
  summarize,
  unitPrice,
} from "./pricing";

const percent10: Coupon = {
  id: "t-pct",
  name: "10%",
  description: "",
  discountType: "percent",
  value: 10,
  minOrder: 20000,
  maxDiscount: 5000,
  expiresAt: "2099-12-31",
};
const amount3000: Coupon = { ...percent10, id: "t-amt", discountType: "amount", value: 3000, minOrder: 30000, maxDiscount: undefined };

describe("unitPrice", () => {
  it("옵션 추가금을 더한다", () => {
    expect(unitPrice({ productId: "p05", optionLabel: "500g (1팩)" })).toBe(12900);
    expect(unitPrice({ productId: "p05", optionLabel: "1kg (2팩)" })).toBe(23900);
  });
  it("없는 상품은 0원", () => {
    expect(unitPrice({ productId: "nope" })).toBe(0);
  });
});

describe("shipping", () => {
  it("빈 주문은 배송비가 없다", () => expect(shippingFeeFor(0)).toBe(0));
  it("기준 미만이면 배송비", () => expect(shippingFeeFor(FREE_SHIPPING_THRESHOLD - 1)).toBe(SHIPPING_FEE));
  it("기준 금액 정확히면 무료", () => expect(shippingFeeFor(FREE_SHIPPING_THRESHOLD)).toBe(0));
  it("무료배송까지 남은 금액은 음수가 되지 않는다", () => {
    expect(freeShippingGap(10000)).toBe(FREE_SHIPPING_THRESHOLD - 10000);
    expect(freeShippingGap(FREE_SHIPPING_THRESHOLD + 5000)).toBe(0);
  });
});

describe("couponDiscountFor", () => {
  it("최소 주문 금액 미만이면 0", () => expect(couponDiscountFor(percent10, 19999)).toBe(0));
  it("정률 할인은 원 단위 내림", () => expect(couponDiscountFor(percent10, 26399)).toBe(2639));
  it("정률 할인은 최대 할인액에서 멈춘다", () => expect(couponDiscountFor(percent10, 100000)).toBe(5000));
  it("정액 할인", () => expect(couponDiscountFor(amount3000, 30000)).toBe(3000));
  it("할인이 상품 금액을 넘지 않는다", () => {
    const big: Coupon = { ...amount3000, value: 50000, minOrder: 0 };
    expect(couponDiscountFor(big, 12000)).toBe(12000);
  });
});

describe("couponOptions", () => {
  it("쓸 수 있는 쿠폰을 할인 큰 순으로", () => {
    const { usable, unusableCount } = couponOptions(40000, [amount3000, percent10]);
    expect(usable.map((c) => c.coupon.id)).toEqual(["t-pct", "t-amt"]); // 4,000원 > 3,000원
    expect(unusableCount).toBe(0);
  });
  it("못 쓰는 쿠폰 중 가장 가까운 조건까지 남은 금액", () => {
    expect(couponOptions(15000, [percent10, amount3000]).nextGap).toBe(5000);
    expect(couponOptions(50000, [percent10, amount3000]).nextGap).toBeNull();
  });
  it("실제 쿠폰 데이터로도 계산된다", () => {
    expect(couponOptions(0, coupons).usable).toHaveLength(0);
  });
});

describe("summarize", () => {
  const items = [
    { productId: "p05", optionLabel: "500g (1팩)", quantity: 2 }, // 25,800
    { productId: "p01", quantity: 1 }, // 6,500
  ];
  it("상품·배송·쿠폰·합계를 한 번에", () => {
    expect(itemsTotalOf(items)).toBe(32300);
    expect(summarize(items, null, [percent10])).toEqual({
      itemsTotal: 32300,
      shippingFee: SHIPPING_FEE,
      couponDiscount: 0,
      total: 32300 + SHIPPING_FEE,
    });
    expect(summarize(items, "t-pct", [percent10]).couponDiscount).toBe(3230);
  });
  it("조건이 깨진 쿠폰을 골라 두어도 할인하지 않는다", () => {
    expect(summarize([{ productId: "p01", quantity: 1 }], "t-pct", [percent10]).couponDiscount).toBe(0);
  });
});
