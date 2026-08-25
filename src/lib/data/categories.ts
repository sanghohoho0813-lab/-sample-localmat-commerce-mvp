import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-vegetable", slug: "vegetable", name: "채소", emoji: "🥬" },
  { id: "cat-fruit", slug: "fruit", name: "과일", emoji: "🍓" },
  { id: "cat-meat", slug: "meat", name: "축산물", emoji: "🥩" },
  { id: "cat-seafood", slug: "seafood", name: "수산물", emoji: "🐟" },
  { id: "cat-processed", slug: "processed", name: "가공식품", emoji: "🍯" },
  { id: "cat-grain", slug: "grain", name: "곡류/견과", emoji: "🌾" },
  { id: "cat-snack", slug: "snack", name: "음료/간식", emoji: "🧃" },
  { id: "cat-gift", slug: "gift", name: "선물세트", emoji: "🎁" },
];

export function getCategory(idOrSlug: string): Category | undefined {
  return categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}
