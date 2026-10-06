import { describe, expect, it } from "vitest";
import { maxQuantityFor, sanitizeCartItems, sanitizeOrders, sanitizeProductIds, sanitizeReviews } from "./persisted";

describe("sanitizeCartItems", () => {
  it("배열이 아니면 빈 장바구니", () => {
    expect(sanitizeCartItems(undefined)).toEqual([]);
    expect(sanitizeCartItems("{broken")).toEqual([]);
  });
  it("없는 상품·없는 옵션·잘못된 수량은 버린다", () => {
    expect(
      sanitizeCartItems([
        { productId: "gone", quantity: 1 },
        { productId: "p05", optionLabel: "10kg", quantity: 1 },
        { productId: "p01", quantity: 0 },
        { productId: "p01", quantity: "abc" },
        null,
      ])
    ).toEqual([]);
  });
  it("옵션이 있는 상품에 옵션이 없으면 첫 옵션으로, 없는 상품엔 옵션을 지운다", () => {
    expect(
      sanitizeCartItems([
        { productId: "p05", quantity: 1 },
        { productId: "p01", optionLabel: "아무거나", quantity: 1 },
      ])
    ).toEqual([
      { productId: "p05", optionLabel: "500g (1팩)", quantity: 1 },
      { productId: "p01", optionLabel: undefined, quantity: 1 },
    ]);
  });
  it("수량은 재고를 넘지 않고, 같은 항목은 합친다", () => {
    const max = maxQuantityFor("p26");
    expect(max).toBe(20);
    expect(
      sanitizeCartItems([
        { productId: "p26", quantity: 15 },
        { productId: "p26", quantity: 15 },
        { productId: "p01", quantity: 2.7 },
      ])
    ).toEqual([
      { productId: "p26", optionLabel: undefined, quantity: 20 },
      { productId: "p01", optionLabel: undefined, quantity: 2 },
    ]);
  });
});

describe("sanitizeProductIds", () => {
  it("있는 상품만, 중복 없이, 개수 제한", () => {
    expect(sanitizeProductIds(["p01", "gone", "p01", 3, "p02", "p03"], 2)).toEqual(["p01", "p02"]);
  });
});

describe("sanitizeOrders / sanitizeReviews", () => {
  it("모양이 맞는 주문만 남긴다", () => {
    const ok = { id: "o1", createdAt: "2026-01-01", items: [], totalAmount: 1000 };
    expect(sanitizeOrders([ok, { id: "o2" }, "x"])).toEqual([ok]);
  });
  it("별점 범위를 벗어난 리뷰는 버린다", () => {
    const base = { id: "r", productId: "p01", content: "좋아요", author: "김*장", date: "2026-01-01" };
    expect(sanitizeReviews([{ ...base, rating: 5 }, { ...base, rating: 9 }, { ...base, rating: 0 }])).toHaveLength(1);
  });
});
