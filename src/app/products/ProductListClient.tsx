"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListFilter, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories, getCategory } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import type { Product } from "@/lib/types";

const sortOptions = [
  { value: "recommend", label: "추천순" },
  { value: "sales", label: "판매순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
  { value: "reviews", label: "후기 많은 순" },
  { value: "new", label: "신상품순" },
];

const priceRanges = [
  { value: "u10", label: "1만원 이하", test: (p: number) => p <= 10000 },
  { value: "10to20", label: "1~2만원", test: (p: number) => p > 10000 && p <= 20000 },
  { value: "20to40", label: "2~4만원", test: (p: number) => p > 20000 && p <= 40000 },
  { value: "o40", label: "4만원 이상", test: (p: number) => p > 40000 },
];

function sortProducts(list: Product[], sort: string): Product[] {
  const sorted = [...list];
  switch (sort) {
    case "sales":
      return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "reviews":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case "new":
      return sorted.sort((a, b) => a.createdRank - b.createdRank);
    default:
      // 추천순: 평점 x 리뷰 가중치
      return sorted.sort(
        (a, b) => b.rating * Math.log10(b.reviewCount + 1) - a.rating * Math.log10(a.reviewCount + 1)
      );
  }
}

const allRegions = Array.from(new Set(products.map((p) => p.region.split(" ")[0])));

export default function ProductListClient({
  initialCategory,
  seasonalOnly,
  initialSort,
}: {
  initialCategory: string;
  seasonalOnly: boolean;
  initialSort: string;
}) {
  const router = useRouter();
  const [sort, setSort] = useState(initialSort);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = getCategory(initialCategory);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.categoryId === category.id);
    if (seasonalOnly) list = list.filter((p) => p.isSeasonal);
    if (selectedPrices.length > 0) {
      list = list.filter((p) =>
        selectedPrices.some((v) => priceRanges.find((r) => r.value === v)?.test(p.price))
      );
    }
    if (selectedRegions.length > 0) {
      list = list.filter((p) => selectedRegions.includes(p.region.split(" ")[0]));
    }
    return sortProducts(list, sort);
  }, [category, seasonalOnly, selectedPrices, selectedRegions, sort]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function resetFilters() {
    setSelectedPrices([]);
    setSelectedRegions([]);
  }

  const activeFilterCount = selectedPrices.length + selectedRegions.length;
  const title = seasonalOnly ? "제철 먹거리" : category ? category.name : "전체 상품";

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2.5 text-sm font-bold text-bark-800">카테고리</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false);
              router.push("/products");
            }}
            className={`rounded-pill border px-3 py-1.5 text-[16px] font-medium transition-colors duration-200 ${
              !category && !seasonalOnly
                ? "border-leaf-600 bg-leaf-600 text-white"
                : "border-bark-200 bg-white text-bark-600 hover:border-leaf-400"
            }`}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                router.push(`/products?category=${c.slug}`);
              }}
              className={`rounded-pill border px-3 py-1.5 text-[16px] font-medium transition-colors duration-200 ${
                category?.id === c.id
                  ? "border-leaf-600 bg-leaf-600 text-white"
                  : "border-bark-200 bg-white text-bark-600 hover:border-leaf-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-bold text-bark-800">가격</h3>
        <div className="space-y-2">
          {priceRanges.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-bark-600">
              <input
                type="checkbox"
                checked={selectedPrices.includes(r.value)}
                onChange={() => toggle(selectedPrices, r.value, setSelectedPrices)}
                className="h-[18px] w-[18px] rounded accent-leaf-600"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-bold text-bark-800">지역</h3>
        <div className="flex flex-wrap gap-1.5">
          {allRegions.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => toggle(selectedRegions, region, setSelectedRegions)}
              className={`rounded-pill border px-3 py-1.5 text-[16px] font-medium transition-colors duration-200 ${
                selectedRegions.includes(region)
                  ? "border-leaf-600 bg-leaf-600 text-white"
                  : "border-bark-200 bg-white text-bark-600 hover:border-leaf-400"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1.5 text-sm font-medium text-bark-400 transition-colors hover:text-bark-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          필터 초기화
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-6 md:py-8">
      <div className="mb-5 md:mb-7">
        <h1 className="text-xl font-extrabold tracking-tight text-bark-900 md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-bark-500">
          {seasonalOnly
            ? "지금 제철을 맞아 가장 맛있는 먹거리만 모았어요."
            : "산지에서 바로 보내드리는 신선한 먹거리입니다."}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-32 rounded-card border border-bark-100 bg-white p-5">{filterPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-bark-500">
              총 <span className="font-bold text-bark-800">{filtered.length}</span>개
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn-outline h-12 gap-1.5 px-4 text-[16px] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-leaf-600 text-[13px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div className="relative">
                <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="정렬"
                  className="h-12 appearance-none rounded-xl border border-bark-200 bg-white pl-9 pr-4 text-[16px] font-medium text-bark-700 outline-none transition-colors focus:border-leaf-400"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-bark-200 bg-white py-20 text-center">
              <span className="text-4xl">🧺</span>
              <p className="font-semibold text-bark-700">조건에 맞는 상품이 없어요</p>
              <p className="text-sm text-bark-400">필터를 조금 넓혀보시겠어요?</p>
              <button type="button" onClick={resetFilters} className="btn-outline mt-2 h-10 px-4 text-sm">
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="필터">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-bark-900/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-bark-900">필터</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-bark-500 hover:bg-cream-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-secondary mt-6 h-13 w-full text-[18px]"
            >
              {filtered.length}개 상품 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
