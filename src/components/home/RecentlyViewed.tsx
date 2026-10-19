"use client";

import Link from "next/link";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/format";
import { useRecentStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import ProductImage from "@/components/ProductImage";

/** 다시 온 사람의 출발점 — 최근 본 상품이 있을 때만 작은 한 줄로 보여 줍니다. */
export default function RecentlyViewed() {
  const hydrated = useHydrated();
  const ids = useRecentStore((s) => s.ids);
  const items = hydrated ? ids.map((id) => getProduct(id)).filter((p) => !!p).slice(0, 8) : [];
  if (items.length === 0) return null;
  return (
    <section className="container-page" aria-labelledby="recent-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="recent-title" className="text-base font-bold text-bark-900 md:text-lg">
          최근 본 상품
        </h2>
        <Link href="/mypage?tab=recent" className="text-sm font-semibold text-bark-500 hover:text-leaf-700">
          전체보기
        </Link>
      </div>
      {/* 모바일은 옆으로 넘기는 작은 사진, PC는 한 줄 4칸의 가로형 타일(사진만 덩그러니 작게 놓이지 않게) */}
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0 md:[&>li:nth-child(n+5)]:hidden">
        {items.map((p) => (
          <li key={p!.id} className="w-28 shrink-0 md:w-auto">
            <Link
              href={`/products/${p!.slug}`}
              className="group block rounded-xl focus-ring md:flex md:items-center md:gap-3 md:bg-white md:p-2.5 md:transition-shadow md:duration-200 md:hover:shadow-soft"
            >
              <ProductImage product={p!} className="w-full rounded-xl md:w-16 md:shrink-0 md:rounded-lg" iconSize="text-2xl" sizes="128px" />
              <div className="min-w-0">
                <p className="mt-1.5 line-clamp-1 text-xs font-medium text-bark-700 group-hover:text-leaf-800 md:mt-0 md:text-sm">{p!.name}</p>
                <p className="text-xs font-bold text-bark-900 md:mt-0.5 md:text-sm">
                  {p!.stock > 0 ? `${formatPrice(p!.price)}원` : <span className="font-medium text-bark-500">시즌 준비 중</span>}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
