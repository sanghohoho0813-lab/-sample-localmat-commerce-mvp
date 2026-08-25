import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import FarmImage from "@/components/FarmImage";
import type { Farm } from "@/lib/types";

/**
 * 농가 스토리 카드 — 실제 농가 사진 위 인용문 오버레이 (첨부 시안의 농가 스토리 섹션).
 * 사진 구도가 "인물 우측 / 여백 좌측"이라 텍스트는 하단 좌측에 배치합니다.
 */
export default function FarmCard({ farm, priority = false }: { farm: Farm; priority?: boolean }) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="group relative block overflow-hidden rounded-card focus-ring tap-highlight-none"
    >
      <div className="relative aspect-[16/10] w-full">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            <FarmImage
              farm={farm}
              priority={priority}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 420px"
            />
          </div>
        </div>

        {/* 텍스트 가독성을 위한 스크림 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-leaf-900/90 via-leaf-900/35 to-transparent" />

        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-bold leading-snug text-white drop-shadow-sm [text-wrap:balance]">
            “{farm.quote}”
          </p>
          <p className="mt-2 flex items-center gap-1 text-[13px] text-leaf-100">
            <MapPin className="h-3.5 w-3.5" />
            {farm.region} · {farm.owner} 농부
          </p>
          <p className="mt-1 text-xs text-leaf-200/85">{farm.items.join(", ")}</p>
        </div>
      </div>
    </Link>
  );
}
