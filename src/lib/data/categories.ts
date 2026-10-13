import type { Category } from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-vegetable", slug: "vegetable", name: "채소", emoji: "🥬", cover: "/images/products/haenam-baechu.webp" },
  { id: "cat-fruit", slug: "fruit", name: "과일", emoji: "🍓", cover: "/images/products/jeju-gamgyul.webp" },
  { id: "cat-meat", slug: "meat", name: "축산물", emoji: "🥩", cover: "/images/products/handon-samgyeopsal.webp" },
  { id: "cat-seafood", slug: "seafood", name: "수산물", emoji: "🐟", cover: "/images/products/wando-jeonbok.webp" },
  { id: "cat-processed", slug: "processed", name: "가공식품", emoji: "🍯", cover: "/images/products/nonsan-ttalgi-jam.webp" },
  { id: "cat-grain", slug: "grain", name: "곡류/견과", emoji: "🌾", cover: "/images/products/haenam-goguma.webp" },
  { id: "cat-snack", slug: "snack", name: "음료/간식", emoji: "🧃", cover: "/images/products/cheongsong-sagwachip.webp" },
  { id: "cat-gift", slug: "gift", name: "선물세트", emoji: "🎁", cover: "/images/products/cheongsong-sagwa-gift.webp" },
];

export function getCategory(idOrSlug: string): Category | undefined {
  return categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}
