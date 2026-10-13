/**
 * 추천 — 무작위가 아니라 '왜 이 상품인지' 말할 수 있는 근거만 씁니다.
 * 1) 함께 먹기 좋은 조합(직접 정리한 짝)  2) 같은 농가(한 상자로 함께 출발)
 * 3) 같은 종류의 지금 제철 상품  4) 무료배송까지 남은 금액을 가장 적게 넘기는 상품
 * 품절·시즌 준비 중인 상품과 이미 고른 상품은 추천하지 않습니다.
 */
import type { CartItem, Product } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { getProduct, products as allProducts } from "@/lib/data/products";
import { freeShippingGap } from "@/lib/pricing";
import { isAvailable, isInSeason } from "@/lib/season";

export interface Recommendation {
  product: Product;
  reason: string;
}

/** 함께 사면 좋은 짝 — 레시피·식탁 기준으로 정리한 실제 조합 */
const PAIRINGS: Record<string, { id: string; reason: string }[]> = {
  p02: [{ id: "p11", reason: "감자조림·감자전에 달걀 한 판" }, { id: "p18", reason: "소시지 감자볶음 재료" }],
  p03: [{ id: "p09", reason: "삼겹살 쌈·볶음에 곁들이기" }, { id: "p10", reason: "목살 구이에 양배추 쌈" }],
  p04: [{ id: "p09", reason: "김장하는 날 수육용" }, { id: "p13", reason: "배춧국에 미역 대신 곁들이기" }],
  p06: [{ id: "p17", reason: "같은 귤로 담근 감귤청" }, { id: "p08", reason: "지금 제철 과일 한 상자 더" }],
  p08: [{ id: "p16", reason: "같은 과수원 사과로 짠 즙" }, { id: "p22", reason: "아이 간식용 사과칩" }],
  p09: [{ id: "p03", reason: "쌈·볶음용 양배추" }, { id: "p04", reason: "보쌈엔 배추 겉절이" }],
  p10: [{ id: "p03", reason: "목살 구이에 양배추 쌈" }, { id: "p02", reason: "목살 감자조림 재료" }],
  p11: [{ id: "p21", reason: "갓 지은 햅쌀밥에 달걀" }, { id: "p02", reason: "감자 달걀 샐러드" }],
  p12: [{ id: "p13", reason: "전복 미역국 끓이기" }, { id: "p21", reason: "전복죽엔 햅쌀" }, { id: "p14", reason: "육수용 다시마" }],
  p13: [{ id: "p12", reason: "전복 미역국 끓이기" }, { id: "p14", reason: "미역국 육수용 다시마" }],
  p14: [{ id: "p13", reason: "다시마 육수로 미역국" }, { id: "p12", reason: "전복 넣은 해물 육수" }],
  p15: [{ id: "p16", reason: "아침 식탁에 사과즙 한 포" }, { id: "p11", reason: "토스트엔 달걀 프라이" }],
  p16: [{ id: "p22", reason: "같은 과수원 사과칩" }, { id: "p08", reason: "생과도 함께" }],
  p17: [{ id: "p06", reason: "생귤도 함께" }, { id: "p16", reason: "아이 음료로 사과즙" }],
  p18: [{ id: "p02", reason: "소시지 감자볶음" }, { id: "p11", reason: "브런치엔 달걀" }],
  p19: [{ id: "p20", reason: "아이 간식으로 고구마도" }, { id: "p23", reason: "간식 바구니에 구운 계란" }],
  p20: [{ id: "p23", reason: "고구마엔 구운 계란" }, { id: "p21", reason: "같은 농가 햅쌀" }],
  p21: [{ id: "p11", reason: "햅쌀밥엔 달걀" }, { id: "p13", reason: "미역국과 한 상" }],
  p22: [{ id: "p16", reason: "같은 과수원 사과즙" }, { id: "p23", reason: "아이 간식으로 구운 계란" }],
  p23: [{ id: "p22", reason: "간식 바구니에 사과칩" }, { id: "p20", reason: "고구마와 함께" }],
  p24: [{ id: "p25", reason: "함께 보내기 좋은 선물세트" }, { id: "p16", reason: "가벼운 선물로 사과즙" }],
  p25: [{ id: "p24", reason: "함께 보내기 좋은 선물세트" }, { id: "p16", reason: "가벼운 선물로 사과즙" }],
};

function categoryName(product: Product): string {
  return categories.find((c) => c.id === product.categoryId)?.name ?? "상품";
}

/** 상세 화면 '함께 사면 좋은 상품' — 근거가 강한 것부터 */
export function recommendFor(
  product: Product,
  month: number,
  { limit = 4, catalog = allProducts }: { limit?: number; catalog?: readonly Product[] } = {}
): Recommendation[] {
  const picked = new Map<string, Recommendation>();
  const add = (p: Product | undefined, reason: string) => {
    if (!p || p.id === product.id || picked.has(p.id) || !isAvailable(p)) return;
    picked.set(p.id, { product: p, reason });
  };

  for (const pair of PAIRINGS[product.id] ?? []) add(catalog.find((p) => p.id === pair.id), pair.reason);
  for (const p of catalog.filter((c) => c.farmId === product.farmId).sort(bySales)) add(p, "같은 농가 · 한 상자로 함께 출발");
  for (const p of catalog.filter((c) => c.categoryId === product.categoryId && isInSeason(c, month)).sort(bySales)) {
    add(p, `지금 제철인 ${categoryName(p)}`);
  }
  for (const p of [...catalog].sort(bySales)) add(p, "요즘 많이 찾는 상품");
  return [...picked.values()].slice(0, limit);
}

/**
 * 장바구니 추천
 * - 무료배송까지 남았다면: 남은 금액을 넘기면서 가장 적게 넘기는 상품(같은 농가 우선)을 맨 앞에
 * - 그다음: 담은 상품과 짝이 맞는 상품, 같은 농가 상품
 */
export function cartSuggestions(
  items: readonly CartItem[],
  itemsTotal: number,
  { limit = 4, catalog = allProducts }: { limit?: number; catalog?: readonly Product[] } = {}
): Recommendation[] {
  const inCart = new Set(items.map((i) => i.productId));
  const cartProducts = items.map((i) => getProduct(i.productId)).filter((p): p is Product => !!p);
  const farms = new Set(cartProducts.map((p) => p.farmId));
  const candidates = catalog.filter((p) => !inCart.has(p.id) && isAvailable(p));
  const picked = new Map<string, Recommendation>();
  const add = (p: Product | undefined, reason: string) => {
    if (!p || picked.has(p.id) || inCart.has(p.id) || !isAvailable(p)) return;
    picked.set(p.id, { product: p, reason });
  };

  const gap = freeShippingGap(itemsTotal);
  if (itemsTotal > 0 && gap > 0) {
    const fill = candidates
      .filter((p) => p.price >= gap)
      .sort((a, b) => a.price - b.price || Number(farms.has(b.farmId)) - Number(farms.has(a.farmId)))[0];
    add(fill, "이 상품 하나면 무료배송");
  }
  for (const p of cartProducts) {
    for (const pair of PAIRINGS[p.id] ?? []) add(catalog.find((c) => c.id === pair.id), pair.reason);
  }
  for (const p of candidates.filter((c) => farms.has(c.farmId)).sort(bySales)) add(p, "같은 농가 · 한 상자로 함께 출발");
  for (const p of [...candidates].sort(bySales)) add(p, "요즘 많이 찾는 상품");
  return [...picked.values()].slice(0, limit);
}

function bySales(a: Product, b: Product) {
  return b.salesCount - a.salesCount;
}
