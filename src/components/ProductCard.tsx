"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product, ProductBadge } from "@/lib/types";
import { getFarm } from "@/lib/data/farms";
import { discountRate, formatPrice } from "@/lib/format";
import { useCartStore, useToastStore } from "@/lib/store";
import Badge from "@/components/Badge";
import ProductImage from "@/components/ProductImage";
import RatingStars from "@/components/RatingStars";
import WishlistButton from "@/components/WishlistButton";

const LOW_STOCK_THRESHOLD = 30;

/**
 * 카드에는 배지를 하나만 — 고르는 데 가장 도움이 되는 것부터.
 * '산지직송'은 로컬맛 상품 전부의 공통 특징이라 카드에서는 빼고 상세에서만 보여 줍니다.
 */
const BADGE_PRIORITY: ProductBadge[] = [
  "베스트",
  "제철",
  "NEW",
  "당일수확",
  "유기농",
  "무농약",
  "동물복지",
  "무항생제",
  "1등급",
];

export function primaryBadge(badges: ProductBadge[]): ProductBadge | undefined {
  return BADGE_PRIORITY.find((b) => badges.includes(b));
}

export default function ProductCard({
  product,
  priority = false,
  sizes,
  showFarm = true,
}: {
  product: Product;
  /** 농가 페이지처럼 이미 농가가 분명한 곳에서는 끕니다. */
  showFarm?: boolean;
  /** 첫 화면(above the fold) 카드에 지정해 LCP를 앞당깁니다. */
  priority?: boolean;
  sizes?: string;
}) {
  const farm = getFarm(product.farmId);
  const rate = discountRate(product.price, product.originalPrice);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
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
    <article className="group relative tap-highlight-none">
      <div className="relative">
        <div className="overflow-hidden rounded-card border border-bark-100 bg-white transition-shadow duration-300 group-hover:shadow-lift">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <ProductImage product={product} priority={priority} sizes={sizes} className="w-full" />
          </div>
        </div>
        {badge && (
          <div className="pointer-events-none absolute left-2.5 top-2.5">
            <Badge label={badge} />
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        {showFarm && <p className="truncate text-xs text-bark-400">{farm?.name}</p>}
        {/* 상품명이 한 줄이어도 두 줄 높이를 잡아 둬서, 같은 줄 카드끼리 가격 위치가 맞습니다. */}
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.75em] text-sm font-medium leading-snug text-bark-800 transition-colors group-hover:text-leaf-700">
          <Link
            href={`/products/${product.slug}`}
            className="outline-none focus-visible:ring-0 focus-visible:ring-offset-0 after:absolute after:inset-0 after:rounded-card after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-leaf-500 focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-cream-100"
          >
            {product.name} {product.unit}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          {rate !== null && (
            <span className="text-base font-extrabold text-tangerine-600">
              {rate}%<span className="sr-only"> 할인</span>
            </span>
          )}
          <span className="text-base font-extrabold text-bark-900">
            {formatPrice(product.price)}
            <span className="text-sm font-bold">원</span>
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          {lowStock && (
            <span className="text-xs font-semibold text-tangerine-600">{product.stock}개 남음</span>
          )}
        </div>
      </div>

      {/* 링크 위에 올라오는 버튼들 — z-10으로 늘어난 링크보다 위에 둡니다. */}
      <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5 z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-square">
        <button
          type="button"
          onClick={quickAdd}
          aria-label={`${product.name} 장바구니 담기`}
          className="pointer-events-auto absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-leaf-700 shadow-soft transition-all duration-200 hover:bg-leaf-600 hover:text-white active:scale-95 focus-ring md:h-10 md:w-10 md:translate-y-1 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
        >
          <ShoppingCart className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}
