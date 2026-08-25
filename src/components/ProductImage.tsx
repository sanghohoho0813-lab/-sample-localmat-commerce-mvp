"use client";

import { useState } from "react";
import { getCategory } from "@/lib/data/categories";
import type { Product } from "@/lib/types";

/**
 * 상품 이미지 영역.
 * - product.image 경로(/public 하위)에 실제 파일을 넣으면 자동으로 이미지가 표시됩니다.
 * - 파일이 없으면 카테고리별 소프트 그라디언트 플레이스홀더를 유지합니다.
 * - aspect ratio를 강제하여 이미지 유무와 무관하게 카드 레이아웃이 유지됩니다.
 */

const categoryTint: Record<string, string> = {
  "cat-vegetable": "from-leaf-100 to-cream-100",
  "cat-fruit": "from-tangerine-100 to-cream-100",
  "cat-meat": "from-[#FBE9E4] to-cream-100",
  "cat-seafood": "from-[#E3EFF4] to-cream-100",
  "cat-processed": "from-[#F6EBD9] to-cream-100",
  "cat-grain": "from-[#F2EDD9] to-cream-100",
  "cat-snack": "from-[#F9EFE0] to-cream-100",
  "cat-gift": "from-[#F3E8EE] to-cream-100",
};

export default function ProductImage({
  product,
  aspect = "aspect-square",
  className = "",
  iconSize = "text-4xl",
}: {
  product: Pick<Product, "name" | "categoryId" | "image">;
  aspect?: string;
  className?: string;
  iconSize?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const category = getCategory(product.categoryId);
  const tint = categoryTint[product.categoryId] ?? "from-cream-200 to-cream-100";

  return (
    <div className={`relative w-full overflow-hidden ${aspect} ${className}`}>
      {/* Placeholder layer */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tint} transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      >
        <span className={`${iconSize} opacity-40 select-none`}>{category?.emoji ?? "🌿"}</span>
      </div>
      {/* Real image (fades in automatically when the asset exists) */}
      {product.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
