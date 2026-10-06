import { describe, expect, it } from "vitest";
import { matches, normalize, searchCatalog } from "./search";

describe("matches", () => {
  it("대소문자·띄어쓰기를 무시한다", () => {
    expect(normalize(" Jeju  Hallabong ")).toBe("jejuhallabong");
    expect(matches("논산 설향 딸기", "설향딸기")).toBe(true);
  });
  it("띄어 쓴 단어가 모두 들어 있으면 순서가 떨어져 있어도 찾는다", () => {
    expect(matches("제주 노지 감귤 3kg", "제주 감귤")).toBe(true);
    expect(matches("제주 노지 감귤 3kg", "제주 사과")).toBe(false);
  });
  it("빈 검색어는 아무것도 찾지 않는다", () => expect(matches("아무 글", "   ")).toBe(false));
});

describe("searchCatalog", () => {
  it("이름에서 찾은 상품이 설명에서 찾은 상품보다 먼저 나온다", () => {
    const { products } = searchCatalog("딸기");
    const firstNonName = products.findIndex((p) => !p.name.includes("딸기"));
    const lastName = products.map((p) => p.name.includes("딸기")).lastIndexOf(true);
    expect(products.length).toBeGreaterThan(0);
    if (firstNonName !== -1) expect(lastName).toBeLessThan(firstNonName);
  });
  it("농부 이름으로 농가를 찾는다", () => {
    expect(searchCatalog("박정호").farms.map((f) => f.slug)).toContain("nonsan-ttalgi");
  });
  it("없는 단어는 빈 결과", () => {
    expect(searchCatalog("zzzz")).toEqual({ products: [], farms: [] });
  });
});
