"use client";

import Image from "next/image";
import { useState } from "react";
import type { Farm } from "@/lib/types";

/**
 * 농가 사진 영역 (16:9).
 * 사진이 없거나 로드 전에는 딥그린 그라디언트가 자리를 지켜 레이아웃이 흔들리지 않습니다.
 * 이미지 교체는 public/images/farms/{slug}.webp 파일만 바꾸면 됩니다.
 */
export default function FarmImage({
  farm,
  sizes,
  priority = false,
  className = "",
}: {
  farm: Pick<Farm, "name" | "owner" | "region" | "image">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br from-leaf-800 via-leaf-700 to-leaf-600 transition-opacity duration-500 ${
          loaded && !failed ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />
      {farm.image && !failed && (
        <Image
          src={farm.image}
          alt={`${farm.region} ${farm.name} ${farm.owner} 농부`}
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
