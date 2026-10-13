"use client";

import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import type { Product, ProductBadge } from "@/lib/types";
import { EtaShort } from "@/components/DeliveryEta";
import { originLabel } from "@/lib/catalog";
import { discountRate, formatPrice } from "@/lib/format";
import { useCartStore, useToastStore } from "@/lib/store";
import Badge from "@/components/Badge";
import ProductImage from "@/components/ProductImage";
import WishlistButton from "@/components/WishlistButton";

const LOW_STOCK_THRESHOLD = 30;

/**
 * 카드에는 배지를 하나만 — 고르는 데 가장 도움이 되는 것부터.
 * '산지직송'은 모든 상품의 공통점이라, '당일수확'·'제철'은 카드 아래 신선도 줄·진열 맥락이 이미 말해 주므로 뺍니다.
 */
const BADGE_PRIORITY: ProductBadge[] = ["베스트", "NEW", "유기농", "무농약", "동물복지", "무항생제", "1등급"];

export function primaryBadge(badges: ProductBadge[]): ProductBadge | undefined {
  return BADGE_PRIORITY.find((b) => badges.includes(b));
}

/**
 * 상품 카드 — 상세에 들어가지 않고도 고를 수 있게:
 * 생산자·원산지 → 상품명·규격 → 가격 → 신선도·도착 예정 → 후기(·남은 수량)
 */
export default function ProductCard({
  product,
  priority = false,
  sizes,
  showFarm = true,
  reason,
}: {
  product: Product;
  /** 농가 페이지처럼 이미 농가가 분명한 곳에서는 끕니다. */
  showFarm?: boolean;
  /** 첫 화면(above the fold) 카드에 지정해 LCP를 앞당깁니다. */
  priority?: boolean;
  sizes?: string;
  /** 추천 근거 — 있으면 원산지 줄 대신 보여 줍니다(예: "같은 농가 · 한 상자로 함께 출발"). */
  reason?: string;
}) {
  const rate = discountRate(product.price, product.originalPrice);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK_THRESHOLD;
  const badge = primaryBadge(product.badges);

  function quickAdd() {
    const defaultOption = product.options?.[0]?.label;
    const { quantity, capped } = addItem(product.id, 1, defaultOption);
    showToast(
      capped
        ? `재고가 ${quantity}개뿐이라 더 담을 수 없어요.`
        : quantity > 1
          ? `장바구니에 담았어요 (총 ${quantity}개)`
          : "장바구니에 담았어요.",
      { label: "보러가기", href: "/cart" }
    );
  }

  // 카드 전체를 누르면 상세로 가되, 찜·담기 버튼을 링크 안에 넣지 않습니다(링크 안 버튼은 HTML 규칙 위반이고
  // 스크린리더·키보드 포커스가 꼬입니다). 상품명 링크를 카드 전체로 늘리는 'stretched link' 방식입니다.
  return (
    <article className="group relative flex h-full flex-col tap-highlight-none">
      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-cream-200">
          <div
            className={`transition-transform duration-500 ease-out group-hover:scale-[1.04] ${soldOut ? "opacity-60 grayscale-[35%]" : ""}`}
          >
            <ProductImage product={product} priority={priority} sizes={sizes} className="w-full" />
          </div>
        </div>
        {soldOut ? (
          <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 rounded-xl bg-bark-900/80 px-3 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm">
            {product.restockNote ?? "품절"}
          </div>
        ) : (
          badge && (
            <div className="pointer-events-none absolute left-2.5 top-2.5">
              <Badge label={badge} />
            </div>
          )
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col px-0.5">
        {reason ? (
          <p className="truncate text-xs font-semibold text-leaf-700">{reason}</p>
        ) : (
          showFarm && <p className="truncate text-xs text-bark-500">{originLabel(product)}</p>
        )}
        {/* 이름이 한 줄이어도 두 줄 높이를 잡아 둬서, 같은 줄 카드끼리 가격 위치가 맞습니다. */}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75em] text-sm font-semibold leading-snug text-bark-900 [word-break:keep-all]">
          <Link
            href={`/products/${product.slug}`}
            className="outline-none focus-visible:ring-0 focus-visible:ring-offset-0 after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-leaf-500 focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-cream-100"
          >
            {product.name} <span className="font-normal text-bark-500">{product.unit}</span>
          </Link>
        </h3>

        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          {rate !== null && !soldOut && (
            <span className="text-base font-extrabold text-tangerine-600">
              {rate}%<span className="sr-only"> 할인</span>
            </span>
          )}
          <span className={`text-base font-extrabold ${soldOut ? "text-bark-400" : "text-bark-900"}`}>
            {formatPrice(product.price)}
            <span className="text-sm font-bold">원</span>
          </span>
        </p>

        {/* 신선도(+남은 수량) — 신선식품을 고르는 이유 */}
        <p className="mt-1 truncate text-xs">
          <span className={`font-semibold ${soldOut ? "text-bark-500" : "text-leaf-700"}`}>{product.harvest}</span>
          {lowStock && <span className="font-semibold text-tangerine-700"> · {product.stock}개 남음</span>}
        </p>

        {/* 후기 · 도착 예정 */}
        <p className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-xs text-bark-500">
          <Star className="h-3.5 w-3.5 shrink-0 fill-tangerine-400 text-tangerine-400" aria-hidden />
          <span className="font-semibold text-bark-700">{product.rating.toFixed(1)}</span>
          {/* 320px 같은 아주 좁은 2열에서는 후기 수를 줄여 도착 예정이 잘리지 않게 합니다(스크린리더용 문구엔 그대로). */}
          <span className="max-[359px]:hidden" aria-hidden>
            ({product.reviewCount.toLocaleString()})
          </span>
          <span className="sr-only">
            별점 {product.rating.toFixed(1)}, 리뷰 {product.reviewCount}개
          </span>
          {!soldOut && (
            <>
              <span className="text-bark-300" aria-hidden>
                ·
              </span>
              <EtaShort product={product} className="truncate text-bark-600" />
            </>
          )}
        </p>
      </div>

      {/* 링크 위에 올라오는 버튼들 — z-10으로 늘어난 링크보다 위에 둡니다. */}
      <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5 z-10" />
      {!soldOut && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-square">
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`${product.name} 장바구니 담기`}
            className="pointer-events-auto absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-leaf-700 shadow-soft transition-all duration-200 hover:bg-leaf-700 hover:text-white active:scale-95 focus-ring md:h-10 md:w-10 md:translate-y-1 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}
    </article>
  );
}
