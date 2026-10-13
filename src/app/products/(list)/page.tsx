import type { Metadata } from "next";
import { currentMonth } from "@/lib/season";
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
      // '제철'은 한국 시간 이번 달 기준 — 서버에서 정해 넘겨 하이드레이션 차이가 없게 합니다.
      month={currentMonth()}
    />
  );
}
