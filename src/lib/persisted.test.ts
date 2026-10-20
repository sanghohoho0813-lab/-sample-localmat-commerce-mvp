import { describe, expect, it } from "vitest";
import {
  maxQuantityFor,
  orderableItems,
  sanitizeCartItems,
  sanitizeOrders,
  sanitizeProductIds,
  sanitizeReviews,
  sanitizeSearchHistory,
  sanitizeUnchecked,
  selectedItems,
} from "./persisted";

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
        { productId: "p02", quantity: 0 },
        { productId: "p02", quantity: "abc" },
        null,
      ])
    ).toEqual([]);
  });
  it("옵션이 있는 상품에 옵션이 없으면 첫 옵션으로, 없는 상품엔 옵션을 지운다", () => {
    expect(
      sanitizeCartItems([
        { productId: "p05", quantity: 1 },
        { productId: "p02", optionLabel: "아무거나", quantity: 1 },
      ])
    ).toEqual([
      { productId: "p05", optionLabel: "500g (1팩)", quantity: 1 },
      { productId: "p02", optionLabel: undefined, quantity: 1 },
    ]);
  });
  it("수량은 재고를 넘지 않고, 같은 항목은 합친다", () => {
    const max = maxQuantityFor("p24");
    expect(max).toBe(25);
    expect(
      sanitizeCartItems([
        { productId: "p24", quantity: 15 },
        { productId: "p24", quantity: 15 },
        { productId: "p02", quantity: 2.7 },
      ])
    ).toEqual([
      { productId: "p24", optionLabel: undefined, quantity: 25 },
      { productId: "p02", optionLabel: undefined, quantity: 2 },
    ]);
  });
  it("품절 상품은 '품절'로 보여 주려고 남기되 주문 대상에서는 뺀다", () => {
    const items = sanitizeCartItems([
      { productId: "p05", quantity: 2 },
      { productId: "p02", quantity: 1 },
    ]);
    expect(items).toHaveLength(2);
    expect(maxQuantityFor("p05")).toBe(0);
    expect(orderableItems(items).map((i) => i.productId)).toEqual(["p02"]);
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

describe("sanitizeSearchHistory", () => {
  it("글자만 남기고 공백을 정리하며 중복은 최근 것 하나만", () => {
    expect(sanitizeSearchHistory(["  제주  감귤 ", 3, null, "딸기", "제주 감귤", ""])).toEqual(["제주 감귤", "딸기"]);
  });
  it("개수 제한과 깨진 값", () => {
    expect(sanitizeSearchHistory(Array.from({ length: 20 }, (_, i) => `검색${i}`))).toHaveLength(8);
    expect(sanitizeSearchHistory("not array")).toEqual([]);
    expect(sanitizeSearchHistory(["x".repeat(41)])).toEqual([]);
  });
});

describe("장바구니 선택", () => {
  const items = [
    { productId: "p06", optionLabel: "3kg", quantity: 1 },
    { productId: "p02", quantity: 2 },
  ];
  it("해제한 항목만 빼고 나머지는 고른 상태", () => {
    expect(selectedItems(items, [])).toHaveLength(2);
    expect(selectedItems(items, ["p06__3kg"]).map((i) => i.productId)).toEqual(["p02"]);
  });
  it("해제 목록은 지금 장바구니에 있는 항목 키만 남긴다", () => {
    expect(sanitizeUnchecked(["p06__3kg", "p06__3kg", "p99__", 7], items)).toEqual(["p06__3kg"]);
    expect(sanitizeUnchecked("broken", items)).toEqual([]);
  });
});
