"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Farm } from "@/lib/types";

/**
 * 농가 스토리 카드 — 어두운 그린 배경 위 인용문 스타일 (첨부 시안의 농가 스토리 섹션).
 * farm.image 를 /public 에 추가하면 배경 사진 위 오버레이로 자연스럽게 전환됩니다.
 */
export default function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="group relative block overflow-hidden rounded-card tap-highlight-none"
    >
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-leaf-800 via-leaf-700 to-leaf-600 transition-transform duration-300">
        {farm.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={farm.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 [&.loaded]:opacity-100"
            onLoad={(e) => e.currentTarget.classList.add("loaded")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-900/85 via-leaf-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold leading-snug text-white [text-wrap:balance]">
            “{farm.quote}”
          </p>
          <p className="mt-2 flex items-center gap-1 text-[13px] text-leaf-100">
            <MapPin className="h-3.5 w-3.5" />
            {farm.region} · {farm.owner} 농부
          </p>
          <p className="mt-1 text-xs text-leaf-200/80">{farm.items.join(", ")}</p>
        </div>
      </div>
    </Link>
  );
}
