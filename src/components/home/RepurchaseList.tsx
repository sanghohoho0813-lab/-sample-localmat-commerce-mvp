import Link from "next/link";
import type { Product } from "@/lib/types";
import { originLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import QuickAddButton from "@/components/QuickAddButton";

/**
 * 다시 찾는 상품 — 처음 온 사람에게 '실패 없는 선택'을 보여 줍니다.
 * 카드 그리드 대신 순위 목록, 근거는 재구매율(최근 90일 구매 고객 중 다시 산 비율).
 */
export default function RepurchaseList({ items }: { items: Product[] }) {
  return (
    <section aria-labelledby="repurchase-title">
      <div className="mb-3 md:mb-4">
        <p className="text-sm font-semibold text-leaf-700">실패 없는 장보기</p>
        <h2 id="repurchase-title" className="mt-0.5 text-xl font-extrabold tracking-tight text-bark-900 md:text-2xl">
          다시 찾는 상품
        </h2>
      </div>
      <ol className="divide-y divide-bark-100 rounded-2xl bg-white px-4 md:px-5">
        {items.map((p, i) => (
          <li key={p.id} className="relative flex items-center gap-2.5 py-3.5 sm:gap-3">
            <span className="w-4 shrink-0 text-center text-base font-extrabold text-leaf-700 tabular-nums sm:w-5">{i + 1}</span>
            <ProductImage product={p} className="w-14 shrink-0 rounded-xl sm:w-16" iconSize="text-xl" sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs">
                <span className="font-bold text-leaf-700">재구매 {Math.round(p.repurchaseRate * 100)}%</span>
                <span className="hidden text-bark-500 sm:inline"> · {originLabel(p)}</span>
              </p>
              {/* 좁은 화면에서도 이름이 잘리지 않게 두 줄까지 */}
              <Link
                href={`/products/${p.slug}`}
                className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-bark-900 [word-break:keep-all] after:absolute after:inset-0 after:content-[''] hover:text-leaf-800 focus-ring"
              >
                {p.name} <span className="font-normal text-bark-500">{p.unit}</span>
              </Link>
              <p className="mt-0.5 text-sm font-extrabold text-bark-900">{formatPrice(p.price)}원</p>
            </div>
            <QuickAddButton product={p} className="relative z-10" />
          </li>
        ))}
      </ol>
      <p className="mt-2 px-1 text-xs text-bark-500">재구매율: 최근 90일 구매 고객 중 같은 상품을 다시 산 고객 비율</p>
    </section>
  );
}
