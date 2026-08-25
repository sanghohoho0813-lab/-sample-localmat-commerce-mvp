import type { Metadata } from "next";
import ProductListClient from "./ProductListClient";

export const metadata: Metadata = { title: "전체 상품" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; filter?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const seasonalOnly = params.filter === "seasonal";
  const sort = params.sort ?? "recommend";

  return (
    <ProductListClient
      key={`${category}-${seasonalOnly}`}
      initialCategory={category}
      seasonalOnly={seasonalOnly}
      initialSort={sort}
    />
  );
}
