"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ListFilter, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
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

/** 모바일 카테고리 칩 — PC·태블릿은 상단 카테고리 바가 같은 역할을 합니다. */
function CategoryChips({ activeSlug, seasonalOnly }: { activeSlug?: string; seasonalOnly: boolean }) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // 뒤쪽 카테고리를 골랐을 때도 선택된 칩이 화면 안에 보이게 합니다.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, []);

  const chips = [
    { key: "all", href: "/products", label: "전체", active: !activeSlug && !seasonalOnly },
    { key: "seasonal", href: "/products?filter=seasonal", label: "제철", active: seasonalOnly },
    ...categories.map((c) => ({
      key: c.slug,
      href: `/products?category=${c.slug}`,
      label: c.name,
      active: activeSlug === c.slug,
    })),
  ];

  return (
    <nav aria-label="카테고리" className="-mx-4 mb-4 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6 md:hidden">
      <div className="flex w-max gap-2">
        {chips.map((c) => (
          <Link
            key={c.key}
            ref={c.active ? activeRef : undefined}
            href={c.href}
            aria-current={c.active ? "page" : undefined}
            className={`flex h-11 shrink-0 items-center rounded-pill border px-4 text-[16px] font-semibold transition-colors duration-200 ${
              c.active
                ? "border-leaf-700 bg-leaf-700 text-white"
                : "border-bark-200 bg-white text-bark-600"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </nav>
  );
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
  const searchParams = useSearchParams();
  const listParam = (key: string) => (searchParams.get(key) ?? "").split(",").filter(Boolean);

  // 정렬·필터는 주소에 남겨 둡니다 — 상품을 보고 뒤로 돌아와도 고른 조건이 그대로입니다.
  const [sort, setSort] = useState(() => {
    const fromUrl = searchParams.get("sort");
    return fromUrl && sortOptions.some((o) => o.value === fromUrl) ? fromUrl : initialSort;
  });
  const [selectedPrices, setSelectedPrices] = useState<string[]>(() =>
    listParam("price").filter((v) => priceRanges.some((r) => r.value === v))
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(() =>
    listParam("region").filter((v) => allRegions.includes(v))
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const put = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key));
    put("sort", sort === "recommend" ? "" : sort);
    put("price", selectedPrices.join(","));
    put("region", selectedRegions.join(","));
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [sort, selectedPrices, selectedRegions]);

  // 모바일 필터 시트 열고 닫기 + 뒤 화면 스크롤 잠금 (ESC는 dialog의 cancel로 처리)
  const drawerRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;
    if (!drawerOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

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

  const renderFilterPanel = (withCategory: boolean) => (
    <div className="space-y-6">
      {withCategory && (
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
      )}

      <div>
        <h3 className="mb-2.5 text-sm font-bold text-bark-800">가격</h3>
        <div className="space-y-0.5">
          {priceRanges.map((r) => (
            <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-[16px] text-bark-700 lg:min-h-9">
              <input
                type="checkbox"
                checked={selectedPrices.includes(r.value)}
                onChange={() => toggle(selectedPrices, r.value, setSelectedPrices)}
                className="h-5 w-5 rounded accent-leaf-600"
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

      {withCategory && activeFilterCount > 0 && (
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
      <h1 className="mb-4 text-xl font-extrabold tracking-tight text-bark-900 md:mb-7 md:text-3xl">{title}</h1>

      <CategoryChips activeSlug={category?.slug} seasonalOnly={seasonalOnly} />

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-32 rounded-card border border-bark-100 bg-white p-5">{renderFilterPanel(true)}</div>
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
            <EmptyState
              icon={ListFilter}
              title="조건에 맞는 상품이 없어요"
              description="필터를 조금 넓혀 보시겠어요?"
              className="rounded-card border border-dashed border-bark-200 bg-white py-16"
            >
              <button type="button" onClick={resetFilters} className="btn-primary h-12 px-6 text-[16px]">
                필터 초기화
              </button>
            </EmptyState>
          ) : (
            <section aria-labelledby="product-list-heading">
              {/* 화면에는 '총 N개'가 이미 보이므로 스크린리더용 제목만 둡니다(제목 단계 h1→h2→h3 유지). */}
              <h2 id="product-list-heading" className="sr-only">
                상품 {filtered.length}개
              </h2>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 모바일 필터 시트 — 네이티브 <dialog>로 최상위 레이어에 띄워 공용 뒤로·앞으로 버튼이 버튼을 가리지 않게 합니다. */}
      <dialog
        ref={drawerRef}
        aria-label="필터"
        onCancel={(e) => {
          e.preventDefault();
          setDrawerOpen(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDrawerOpen(false);
        }}
        className="m-0 h-full max-h-none w-full max-w-none items-end bg-transparent p-0 backdrop:bg-bark-900/40 open:flex lg:hidden"
      >
        <div className="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white animate-fade-up">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-lg font-extrabold text-bark-900">필터</h2>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setDrawerOpen(false)}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-bark-500 hover:bg-cream-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{renderFilterPanel(false)}</div>
          {/* 초기화와 적용을 나란히 — 몇 개가 남는지 누르기 전에 보입니다. */}
          <div
            className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-bark-100 px-5 pt-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              className="btn-outline h-13 gap-1.5 px-4 text-[16px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn-secondary h-13 text-[18px]"
            >
              {filtered.length}개 상품 보기
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
