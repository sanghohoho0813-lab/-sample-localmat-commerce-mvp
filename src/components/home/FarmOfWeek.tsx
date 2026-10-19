import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Farm, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import FarmImage from "@/components/FarmImage";
import ProductImage from "@/components/ProductImage";
import QuickAddButton from "@/components/QuickAddButton";

/**
 * 이번 주 농가 — 이야기와 상품을 한 덩어리로. 읽다가 바로 담을 수 있게 지금 보내는 상품을 붙여 둡니다.
 */
export default function FarmOfWeek({ farm, items }: { farm: Farm; items: Product[] }) {
  return (
    <section aria-labelledby="farm-week-title">
      <div className="mb-3 md:mb-4">
        <p className="text-sm font-semibold text-leaf-700">이번 주 농가</p>
        <h2 id="farm-week-title" className="mt-0.5 text-xl font-bold tracking-tight text-bark-900 md:text-2xl">
          {farm.name}
        </h2>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white">
        <Link href={`/farms/${farm.slug}`} className="group relative block aspect-[16/9] focus-ring">
          <FarmImage farm={farm} sizes="(max-width: 1023px) 100vw, 560px" />
          <div className="absolute inset-0 bg-gradient-to-t from-bark-900/80 via-bark-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
            <p className="text-lg font-bold leading-snug [text-wrap:balance] md:text-xl">“{farm.quote}”</p>
            <p className="mt-1.5 flex items-center gap-1 text-sm text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              {farm.region} · {farm.owner} 농부 · {farm.since}년부터
            </p>
          </div>
        </Link>
        <div className="px-4 pb-2 pt-3 md:px-5">
          <p className="text-sm font-semibold text-bark-700">지금 보내드리는 상품</p>
          <ul className="divide-y divide-bark-100">
            {items.map((p) => (
              <li key={p.id} className="relative flex items-center gap-3 py-3">
                <ProductImage product={p} className="w-14 shrink-0 rounded-lg" iconSize="text-lg" sizes="56px" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="line-clamp-2 text-sm font-semibold leading-snug text-bark-900 [word-break:keep-all] after:absolute after:inset-0 after:content-[''] hover:text-leaf-800 focus-ring"
                  >
                    {p.name} <span className="font-normal text-bark-500">{p.unit}</span>
                  </Link>
                  {/* 자리가 모자라면 수확 정보만 통째로 다음 줄로 */}
                  <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="whitespace-nowrap font-bold text-bark-900">{formatPrice(p.price)}원</span>
                    <span className="whitespace-nowrap text-xs font-semibold text-leaf-700">{p.harvest}</span>
                  </p>
                </div>
                <QuickAddButton product={p} className="relative z-10" />
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={`/farms/${farm.slug}`}
          className="flex h-12 items-center justify-center gap-1 border-t border-bark-100 text-sm font-semibold text-bark-600 transition-colors hover:text-leaf-700"
        >
          농가 이야기 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
