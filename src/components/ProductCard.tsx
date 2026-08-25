"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getFarm } from "@/lib/data/farms";
import { discountRate, formatPrice } from "@/lib/format";
import { useCartStore, useToastStore } from "@/lib/store";
import Badge from "@/components/Badge";
import ProductImage from "@/components/ProductImage";
import RatingStars from "@/components/RatingStars";
import WishlistButton from "@/components/WishlistButton";

const LOW_STOCK_THRESHOLD = 30;

export default function ProductCard({
  product,
  priority = false,
  sizes,
}: {
  product: Product;
  /** 첫 화면(above the fold) 카드에 지정해 LCP를 앞당깁니다. */
  priority?: boolean;
  sizes?: string;
}) {
  const farm = getFarm(product.farmId);
  const rate = discountRate(product.price, product.originalPrice);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const lowStock = product.stock <= LOW_STOCK_THRESHOLD;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const defaultOption = product.options?.[0]?.label;
    addItem(product.id, 1, defaultOption);
    showToast("장바구니에 담았어요.", { label: "보러가기", href: "/cart" });
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-card focus-ring tap-highlight-none"
      aria-label={`${product.name} ${product.unit}`}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-card border border-bark-100 bg-white transition-shadow duration-300 group-hover:shadow-lift">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <ProductImage product={product} priority={priority} sizes={sizes} className="w-full" />
          </div>
        </div>

        <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />
        <button
          type="button"
          onClick={quickAdd}
          aria-label={`${product.name} 장바구니 담기`}
          className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-leaf-700 shadow-soft transition-all duration-200 hover:bg-leaf-600 hover:text-white active:scale-95 focus-ring md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <ShoppingCart className="h-[18px] w-[18px]" />
        </button>
        {product.badges.length > 0 && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1 pr-12">
            {product.badges.slice(0, 2).map((b) => (
              <Badge key={b} label={b} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-1 px-0.5">
        <p className="truncate text-xs text-bark-400">
          {product.region} · {farm?.name}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-bark-800 transition-colors group-hover:text-leaf-700">
          {product.name} {product.unit}
        </h3>
        {/* 글자가 커지면 좁은 카드에서 3요소가 한 줄에 안 들어가므로 줄바꿈을 허용합니다. */}
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          {rate !== null && <span className="text-base font-extrabold text-tangerine-500">{rate}%</span>}
          <span className="text-base font-extrabold text-bark-900">
            {formatPrice(product.price)}
            <span className="text-sm font-bold">원</span>
          </span>
          {product.originalPrice && (
            <span className="whitespace-nowrap text-xs text-bark-300 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          {lowStock && (
            <span className="text-xs font-semibold text-tangerine-600">
              {product.stock}개 남음
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
