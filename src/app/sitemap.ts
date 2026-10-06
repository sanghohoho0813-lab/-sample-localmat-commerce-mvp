import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { farms } from "@/lib/data/farms";
import { products } from "@/lib/data/products";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/products"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: url(`/products?category=${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: url(`/products/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: url("/farms"), changeFrequency: "monthly", priority: 0.6 },
    ...farms.map((f) => ({ url: url(`/farms/${f.slug}`), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
