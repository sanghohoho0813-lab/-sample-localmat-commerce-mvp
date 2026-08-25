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

export default function ProductCard({ product }: { product: Product }) {
  const farm = getFarm(product.farmId);
  const rate = discountRate(product.price, product.originalPrice);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

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
      className="group block tap-highlight-none"
      aria-label={`${product.name} ${product.unit}`}
    >
      <div className="relative">
        <ProductImage
          product={product}
          className="rounded-card border border-bark-100 bg-white transition-shadow duration-300 group-hover:shadow-lift"
        />
        <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />
        <button
          type="button"
          onClick={quickAdd}
          aria-label="장바구니 담기"
          className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-leaf-700 shadow-soft transition-all duration-200 hover:bg-leaf-600 hover:text-white active:scale-95 md:opacity-0 md:translate-y-1 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <ShoppingCart className="h-[18px] w-[18px]" />
        </button>
        {product.badges.length > 0 && (
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1 pr-12">
            {product.badges.slice(0, 2).map((b) => (
              <Badge key={b} label={b} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-1 px-0.5">
        <p className="text-xs text-bark-400">
          {product.region} · {farm?.name}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-bark-800 transition-colors group-hover:text-leaf-700">
          {product.name} {product.unit}
        </h3>
        <div className="flex items-baseline gap-1.5">
          {rate !== null && <span className="text-base font-extrabold text-tangerine-500">{rate}%</span>}
          <span className="text-base font-extrabold text-bark-900">
            {formatPrice(product.price)}
            <span className="text-sm font-bold">원</span>
          </span>
          {product.originalPrice && (
            <span className="text-xs text-bark-300 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          )}
        </div>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </Link>
  );
}
