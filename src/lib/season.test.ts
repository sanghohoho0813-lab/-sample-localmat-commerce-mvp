import { describe, expect, it } from "vitest";
import { getProduct } from "./data/products";
import { currentMonth, isAvailable, isInSeason, seasonLabel } from "./season";

describe("seasonLabel", () => {
  it("이어진 달은 범위로", () => expect(seasonLabel([10, 11, 12])).toBe("10~12월"));
  it("해를 넘기는 범위도 하나로", () => expect(seasonLabel([11, 12, 1, 2, 3])).toBe("11~3월"));
  it("연중 상품", () => {
    expect(seasonLabel([])).toBe("연중");
    expect(seasonLabel([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe("연중");
  });
  it("떨어진 달은 나눠서", () => expect(seasonLabel([1, 2, 7])).toBe("1~2월, 7월"));
});

describe("isInSeason / currentMonth", () => {
  it("10월엔 사과·고구마가 제철, 딸기는 아님", () => {
    expect(isInSeason(getProduct("p08")!, 10)).toBe(true);
    expect(isInSeason(getProduct("p20")!, 10)).toBe(true);
    expect(isInSeason(getProduct("p05")!, 10)).toBe(false);
  });
  it("연중 상품은 제철로 치지 않는다", () => expect(isInSeason(getProduct("p09")!, 10)).toBe(false));
  it("한국 시간으로 월이 바뀐다", () => {
    expect(currentMonth(new Date("2026-10-31T15:30:00Z"))).toBe(11); // KST 11/1 00:30
  });
  it("시즌 준비 중인 상품은 살 수 없다", () => {
    expect(isAvailable(getProduct("p05")!)).toBe(false);
    expect(getProduct("p05")!.restockNote).toBeTruthy();
  });
});
