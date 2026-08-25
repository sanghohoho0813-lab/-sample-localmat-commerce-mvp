"use client";

import Image from "next/image";
import { useState } from "react";
import { getCategory } from "@/lib/data/categories";
import type { Product } from "@/lib/types";

/**
 * 상품 이미지 영역.
 * - product.image 경로(/public 하위)의 파일을 next/image로 최적화해 렌더링합니다.
 * - 파일이 없거나 로드 전에는 카테고리별 소프트 그라디언트 플레이스홀더가 유지됩니다.
 * - aspect ratio를 강제하므로 이미지 유무와 무관하게 카드 레이아웃이 흔들리지 않습니다.
 * - 이미지 교체는 public/images/products/{slug}.webp 파일만 바꾸면 됩니다.
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
  sizes = "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 300px",
  priority = false,
}: {
  product: Pick<Product, "name" | "categoryId" | "image">;
  aspect?: string;
  className?: string;
  iconSize?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const category = getCategory(product.categoryId);
  const tint = categoryTint[product.categoryId] ?? "from-cream-200 to-cream-100";
  const showPlaceholder = !product.image || failed || !loaded;

  // 폭은 항상 호출부(className)가 정합니다. 여기서 w-full을 기본으로 주면
  // 목록형(w-full)과 썸네일형(w-20 등)의 유틸리티가 충돌해 폭이 0으로 무너집니다.
  return (
    <div className={`relative overflow-hidden ${aspect} ${className}`}>
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tint} transition-opacity duration-500 ${
          showPlaceholder ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <span className={`${iconSize} opacity-40 select-none`}>{category?.emoji ?? "🌿"}</span>
      </div>

      {product.image && !failed && (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
