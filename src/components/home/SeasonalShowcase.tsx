import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { originLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { seasonLabel } from "@/lib/season";

/**
 * 이번 달 제철 — 그리드 카드 대신 사진이 큰 세로 카드. "지금 사야 하는 이유"(출하 시기·수확 방식)를 사진 위에 바로 씁니다.
 * 모바일은 옆으로 넘겨 보고, PC는 한 줄에 다 보입니다.
 */
export default function SeasonalShowcase({ month, items }: { month: number; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <section className="container-page" aria-labelledby="seasonal-title">
      <div className="mb-4 flex items-end justify-between gap-3 md:mb-6">
        <div>
          <p className="text-sm font-semibold text-leaf-700">지금 출하 중</p>
          <h2 id="seasonal-title" className="mt-0.5 text-xl font-extrabold tracking-tight text-bark-900 md:text-2xl">
            {month}월 제철 장보기
          </h2>
        </div>
        <Link
          href="/products?filter=seasonal"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-bark-600 transition-colors hover:text-leaf-700"
        >
          전체보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-6">
        {items.map((p, i) => (
          <li key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
            <Link href={`/products/${p.slug}`} className="group block focus-ring rounded-2xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-200">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    priority={i < 2}
                    sizes="(max-width: 767px) 62vw, (max-width: 1023px) 33vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bark-900/85 via-bark-900/40 to-transparent px-3.5 pb-3.5 pt-12 text-white">
                  <p className="text-xs font-semibold text-leaf-200">{seasonLabel(p.season)} 제철</p>
                  <p className="mt-0.5 text-sm font-bold leading-snug [word-break:keep-all]">{p.harvest}</p>
                </div>
              </div>
              <p className="mt-2.5 truncate text-xs text-bark-500">{originLabel(p)}</p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-bark-900 [word-break:keep-all] group-hover:text-leaf-800">
                {p.name} <span className="font-normal text-bark-500">{p.unit}</span>
              </p>
              <p className="mt-1 text-base font-extrabold text-bark-900">
                {formatPrice(p.price)}
                <span className="text-sm font-bold">원</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
