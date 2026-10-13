import { describe, expect, it } from "vitest";
import { getProduct } from "./data/products";
import { freeShippingGap } from "./pricing";
import { cartSuggestions, recommendFor } from "./recommend";

describe("recommendFor", () => {
  it("짝이 맞는 상품을 근거와 함께 먼저", () => {
    const recs = recommendFor(getProduct("p12")!, 10); // 전복
    expect(recs[0].product.id).toBe("p13");
    expect(recs[0].reason).toContain("미역국");
  });
  it("자기 자신·품절 상품은 추천하지 않는다", () => {
    const recs = recommendFor(getProduct("p15")!, 10); // 딸기잼 — 같은 농가 딸기는 시즌 준비 중
    expect(recs.map((r) => r.product.id)).not.toContain("p15");
    expect(recs.every((r) => r.product.stock > 0)).toBe(true);
  });
  it("모든 추천에 이유가 있다", () => {
    for (const r of recommendFor(getProduct("p02")!, 10, { limit: 8 })) expect(r.reason.length).toBeGreaterThan(0);
  });
});

describe("cartSuggestions", () => {
  it("무료배송까지 남았다면 가장 적게 넘기는 상품을 맨 앞에", () => {
    const items = [{ productId: "p09", optionLabel: "구이용 (두께 1.5cm)", quantity: 2 }]; // 27,000원
    const gap = freeShippingGap(27000);
    const [first] = cartSuggestions(items, 27000);
    expect(first.reason).toBe("이 상품 하나면 무료배송");
    expect(first.product.price).toBeGreaterThanOrEqual(gap);
  });
  it("이미 담은 상품은 빼고 추천", () => {
    const recs = cartSuggestions([{ productId: "p12", quantity: 1, optionLabel: "대 (7~8미)" }], 29900);
    expect(recs.map((r) => r.product.id)).not.toContain("p12");
  });
});
