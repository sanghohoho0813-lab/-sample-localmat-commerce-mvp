"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, SearchX, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import FarmCard from "@/components/FarmCard";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/lib/data/categories";
import { searchCatalog } from "@/lib/search";
import { useSearchHistoryStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
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

/** 검색 첫 화면 — 최근 검색어(지우기) → 많이 찾는 검색어 순위 → 카테고리로 둘러보기 */
function SearchLanding() {
  const hydrated = useHydrated();
  const terms = useSearchHistoryStore((s) => s.terms);
  const removeTerm = useSearchHistoryStore((s) => s.remove);
  const clearTerms = useSearchHistoryStore((s) => s.clear);
  const recent = hydrated ? terms : [];

  return (
    <div className="mx-auto mt-6 max-w-xl space-y-9 md:mt-4">
      <h1 className="sr-only">검색</h1>

      {recent.length > 0 && (
        <section aria-labelledby="recent-search-title">
          <div className="flex items-center justify-between">
            <h2 id="recent-search-title" className="text-base font-bold text-bark-900">
              최근 검색어
            </h2>
            <button
              type="button"
              onClick={clearTerms}
              className="-mr-2 h-10 rounded-lg px-2 text-sm font-medium text-bark-500 transition-colors hover:text-bark-800"
            >
              전체 삭제
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {recent.map((t) => (
              <li key={t} className="flex h-10 items-center rounded-pill border border-bark-200 bg-white pl-3.5 pr-1">
                <Link
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="flex items-center gap-1.5 text-[15px] text-bark-700 hover:text-leaf-700"
                >
                  <Clock className="h-3.5 w-3.5 text-bark-400" aria-hidden />
                  {t}
                </Link>
                <button
                  type="button"
                  onClick={() => removeTerm(t)}
                  aria-label={`최근 검색어 ${t} 지우기`}
                  className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full text-bark-400 transition-colors hover:bg-cream-100 hover:text-bark-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="popular-search-title">
        <h2 id="popular-search-title" className="text-base font-bold text-bark-900">
          많이 찾는 검색어
        </h2>
        <ol className="mt-1 grid grid-cols-2 gap-x-6">
          {popularKeywords.map((k, i) => (
            <li key={k}>
              <Link
                href={`/search?q=${encodeURIComponent(k)}`}
                className="flex h-12 items-center gap-3 border-b border-bark-100 text-[16px] text-bark-800 transition-colors hover:text-leaf-700"
              >
                <span aria-hidden className={`w-4 text-center font-bold tabular-nums ${i < 3 ? "text-leaf-700" : "text-bark-400"}`}>
                  {i + 1}
                </span>
                {k}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="browse-category-title">
        <h2 id="browse-category-title" className="text-base font-bold text-bark-900">
          카테고리로 둘러보기
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/products?category=${c.slug}`}
                className="flex h-10 items-center rounded-pill bg-white px-4 text-[15px] text-bark-700 transition-colors hover:text-leaf-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function SearchClient({ query }: { query: string }) {
  // 검색한 말은 최근 검색어로 남깁니다(검색창·인기 검색어·주소 어디서 왔든).
  const remember = useSearchHistoryStore((s) => s.add);
  useEffect(() => {
    if (query.trim()) remember(query);
  }, [query, remember]);

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
        <SearchBar initialQuery={query} autoFocus={!query} onCream />
      </div>

      {!query ? (
        <SearchLanding />
      ) : (
        <>
          <h1 className="mt-5 text-xl font-bold text-bark-900 md:mt-0 md:text-2xl">
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
