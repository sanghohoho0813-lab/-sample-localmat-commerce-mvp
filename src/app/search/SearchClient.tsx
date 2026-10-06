"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import FarmCard from "@/components/FarmCard";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { searchCatalog } from "@/lib/search";
import { useTabs } from "@/lib/useTabs";

const RESULT_TABS = ["products", "farms"] as const;

const popularKeywords = ["딸기", "전복", "유정란", "제주", "고구마", "선물세트"];

function KeywordChips() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {popularKeywords.map((k) => (
        <Link
          key={k}
          href={`/search?q=${encodeURIComponent(k)}`}
          className="flex h-11 items-center rounded-pill border border-bark-200 bg-white px-5 text-[16px] text-bark-700 transition-colors hover:border-leaf-400 hover:text-leaf-700"
        >
          {k}
        </Link>
      ))}
    </div>
  );
}

export default function SearchClient({ query }: { query: string }) {
  const { products: matchedProducts, farms: matchedFarms } = useMemo(() => searchCatalog(query), [query]);

  // 결과가 있는 쪽 탭을 먼저 보여 줍니다(예: 농부 이름으로 검색하면 '농가' 탭).
  const [tab, setTab] = useState<"products" | "farms">(
    matchedProducts.length === 0 && matchedFarms.length > 0 ? "farms" : "products"
  );
  const { tabListProps, tabProps, panelProps } = useTabs(RESULT_TABS, tab, setTab);

  const totalCount = matchedProducts.length + matchedFarms.length;

  return (
    <div className="container-page py-5 md:py-8">
      <div className="mx-auto max-w-xl md:hidden">
        <SearchBar initialQuery={query} autoFocus={!query} />
      </div>

      {!query ? (
        <div className="mt-10 text-center md:mt-16">
          <h1 className="text-xl font-extrabold text-bark-900">무엇을 찾고 계세요?</h1>
          <p className="mt-2 text-bark-500">상품명, 지역, 농가 이름으로 찾을 수 있어요.</p>
          <p className="mb-3 mt-8 text-sm font-semibold text-bark-400">많이 찾는 검색어</p>
          <KeywordChips />
        </div>
      ) : (
        <>
          <h1 className="mt-5 text-xl font-extrabold text-bark-900 md:mt-0 md:text-2xl">
            ‘<span className="text-leaf-700">{query}</span>’ 검색 결과{" "}
            <span className="text-bark-400">{totalCount}</span>
          </h1>

          {totalCount === 0 ? (
            <EmptyState
              icon={SearchX}
              title="검색 결과가 없어요"
              description="이런 검색어는 어떠세요?"
              className="py-12 md:py-16"
            >
              <KeywordChips />
            </EmptyState>
          ) : (
            <>
              <div {...tabListProps} aria-label="검색 결과 종류" className="mt-4 flex gap-1 border-b border-bark-100">
                {(
                  [
                    { id: "products", label: `상품 ${matchedProducts.length}` },
                    { id: "farms", label: `농가 ${matchedFarms.length}` },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    {...tabProps(t.id)}
                    className={`h-12 border-b-2 px-4 text-[16px] font-semibold transition-colors duration-200 ${
                      tab === t.id
                        ? "border-leaf-700 text-leaf-800"
                        : "border-transparent text-bark-400 hover:text-bark-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div {...panelProps} className="mt-6 outline-none">
                <h2 className="sr-only">{tab === "products" ? "상품 검색 결과" : "농가 검색 결과"}</h2>
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
