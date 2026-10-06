import type { Farm, Product } from "@/lib/types";
import { getCategory } from "@/lib/data/categories";
import { farms as allFarms, getFarm } from "@/lib/data/farms";
import { products as allProducts } from "@/lib/data/products";

/** 대소문자·띄어쓰기를 무시하고 비교합니다. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

/**
 * 검색어가 이 글에 맞는지.
 * - 띄어 쓴 단어는 모두 들어 있으면 맞음 — "제주 감귤"로 "제주 노지 감귤"을 찾습니다.
 * - 붙여 쓴 검색어도 맞음 — "설향딸기"로 "설향 딸기"를 찾습니다.
 */
export function matches(haystack: string, query: string): boolean {
  const text = normalize(haystack);
  const whole = normalize(query);
  if (!whole) return false;
  if (text.includes(whole)) return true;
  const terms = query.split(/\s+/).map(normalize).filter(Boolean);
  return terms.length > 1 && terms.every((t) => text.includes(t));
}

function productText(p: Product): string {
  return [p.name, p.region, p.summary, p.unit, getFarm(p.farmId)?.name ?? "", getCategory(p.categoryId)?.name ?? ""].join(
    " "
  );
}

function farmText(f: Farm): string {
  return [f.name, f.region, f.owner, f.items.join(" ")].join(" ");
}

/**
 * 상품·농가 검색. 상품은 이름에서 찾은 것을 먼저, 그다음 많이 팔린 순으로 보여 줍니다
 * (설명에만 "딸기"가 들어간 잼보다 딸기 자체가 위에 오도록).
 */
export function searchCatalog(
  query: string,
  products: readonly Product[] = allProducts,
  farms: readonly Farm[] = allFarms
): { products: Product[]; farms: Farm[] } {
  const q = query.trim();
  if (!q) return { products: [], farms: [] };
  const found = products.filter((p) => matches(productText(p), q));
  const inName = (p: Product) => (matches(`${p.name} ${p.unit}`, q) ? 0 : 1);
  return {
    products: [...found].sort((a, b) => inName(a) - inName(b) || b.salesCount - a.salesCount),
    farms: farms.filter((f) => matches(farmText(f), q)),
  };
}
