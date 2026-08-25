"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import FarmCard from "@/components/FarmCard";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { getCategory } from "@/lib/data/categories";
import { farms, getFarm } from "@/lib/data/farms";
import { products } from "@/lib/data/products";

const popularKeywords = ["딸기", "전복", "유정란", "제주", "고구마", "선물세트"];

export default function SearchClient({ query }: { query: string }) {
  const [tab, setTab] = useState<"products" | "farms">("products");

  const { matchedProducts, matchedFarms } = useMemo(() => {
    if (!query) return { matchedProducts: [], matchedFarms: [] };
    const q = query.toLowerCase();
    const matchedProducts = products.filter((p) => {
      const farm = getFarm(p.farmId);
      const category = getCategory(p.categoryId);
      return [p.name, p.region, p.summary, p.unit, farm?.name ?? "", category?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    const matchedFarms = farms.filter((f) =>
      [f.name, f.region, f.owner, f.items.join(" ")].join(" ").toLowerCase().includes(q)
    );
    return { matchedProducts, matchedFarms };
  }, [query]);

  const totalCount = matchedProducts.length + matchedFarms.length;

  return (
    <div className="container-page py-6 md:py-8">
      <div className="mx-auto max-w-xl md:hidden">
        <SearchBar initialQuery={query} />
      </div>

      {!query ? (
        <div className="mt-8 text-center md:mt-16">
          <h1 className="text-lg font-extrabold text-bark-900">무엇을 찾고 계세요?</h1>
          <p className="mt-1.5 text-sm text-bark-500">상품명, 지역, 농가명으로 검색해보세요.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {popularKeywords.map((k) => (
              <Link
                key={k}
                href={`/search?q=${encodeURIComponent(k)}`}
                className="rounded-pill border border-bark-200 bg-white px-4 py-2 text-sm text-bark-600 transition-colors hover:border-leaf-400 hover:text-leaf-700"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-5 text-lg font-extrabold text-bark-900 md:mt-0 md:text-2xl">
            ‘<span className="text-leaf-700">{query}</span>’ 검색 결과{" "}
            <span className="text-bark-400">{totalCount}</span>
          </h1>

          {totalCount === 0 ? (
            <div className="mt-10 flex flex-col items-center py-14 text-center">
              <SearchX className="h-12 w-12 text-bark-300" />
              <p className="mt-4 font-semibold text-bark-700">검색 결과가 없어요</p>
              <p className="mt-1.5 text-sm text-bark-400">
                다른 검색어로 시도해보시거나, 제철 상품을 둘러보세요.
              </p>
              <Link href="/products?filter=seasonal" className="btn-primary mt-6 h-11 px-5 text-sm">
                제철 상품 보러가기
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-1 border-b border-bark-100">
                {(
                  [
                    { id: "products", label: `상품 ${matchedProducts.length}` },
                    { id: "farms", label: `농가 ${matchedFarms.length}` },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      tab === t.id
                        ? "border-leaf-700 text-leaf-800"
                        : "border-transparent text-bark-400 hover:text-bark-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {tab === "products" ? (
                  matchedProducts.length === 0 ? (
                    <p className="py-14 text-center text-sm text-bark-400">일치하는 상품이 없어요.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
                      {matchedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )
                ) : matchedFarms.length === 0 ? (
                  <p className="py-14 text-center text-sm text-bark-400">일치하는 농가가 없어요.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matchedFarms.map((f) => (
                      <FarmCard key={f.id} farm={f} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
