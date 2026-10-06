"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useTabs } from "@/lib/useTabs";
import { products } from "@/lib/data/products";

const tabs = [
  {
    id: "best",
    label: "인기",
    href: "/products?sort=sales",
    list: [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8),
  },
  {
    id: "seasonal",
    label: "제철",
    href: "/products?filter=seasonal",
    list: products.filter((p) => p.isSeasonal).slice(0, 8),
  },
  {
    id: "new",
    label: "신상품",
    href: "/products?sort=new",
    list: [...products].sort((a, b) => a.createdRank - b.createdRank).slice(0, 8),
  },
] as const;

type TabId = (typeof tabs)[number]["id"];
const TAB_IDS = tabs.map((t) => t.id);

/**
 * 홈의 상품 진열 — '추천'과 '제철'을 따로 늘어놓으면 같은 상품이 두 번 나와서
 * 하나의 진열대에 탭으로 묶었습니다.
 */
export default function HomeProductTabs() {
  const [tabId, setTabId] = useState<TabId>("best");
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const { tabListProps, tabProps, panelProps } = useTabs(TAB_IDS, tabId, setTabId);

  return (
    <section className="container-page" aria-labelledby="home-products-title">
      <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
        <h2 id="home-products-title" className="text-lg font-extrabold tracking-tight text-bark-900 md:text-2xl">
          오늘의 장보기
        </h2>
        <Link
          href={tab.href}
          className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-bark-500 transition-colors hover:text-leaf-700"
        >
          {tab.label} 전체보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div {...tabListProps} aria-label="상품 묶음" className="mb-5 flex gap-2">
        {tabs.map((t) => {
          const active = t.id === tabId;
          return (
            <button
              key={t.id}
              {...tabProps(t.id)}
              className={`h-11 rounded-pill border px-5 text-[16px] font-semibold transition-colors duration-200 focus-ring ${
                active
                  ? "border-leaf-700 bg-leaf-700 text-white"
                  : "border-bark-200 bg-white text-bark-600 hover:border-leaf-400 hover:text-leaf-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        {...panelProps}
        className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:grid-cols-4"
      >
        {tab.list.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={tabId === "best" && i < 4} />
        ))}
      </div>
    </section>
  );
}
