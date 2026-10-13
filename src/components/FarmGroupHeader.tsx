"use client";

import Link from "next/link";
import { Snowflake, Sun, Thermometer } from "lucide-react";
import type { Product, ShippingTemp } from "@/lib/types";
import { getFarm } from "@/lib/data/farms";
import { EtaDate } from "@/components/DeliveryEta";

const TEMP_ICON: Record<ShippingTemp, typeof Sun> = { 냉장: Thermometer, 냉동: Snowflake, 상온: Sun };

/**
 * 농가 묶음 머리 — "논산 딸기 농장 · 냉장 · 내일(수) 도착"
 * 같은 농가 상품은 한 상자로 함께 출발하므로, 받는 날·포장 온도를 묶음 단위로 보여 줍니다.
 */
export default function FarmGroupHeader({
  farmId,
  products,
  arrival,
}: {
  farmId: string;
  products: readonly Product[];
  /** 지난 주문처럼 도착일이 정해져 있으면 그 문구 */
  arrival?: string;
}) {
  const farm = getFarm(farmId);
  // 냉장·냉동이 섞이면 더 차가운 쪽으로 포장합니다
  const temp: ShippingTemp = products.some((p) => p.temp === "냉동")
    ? "냉동"
    : products.some((p) => p.temp === "냉장")
      ? "냉장"
      : "상온";
  const Icon = TEMP_ICON[temp];
  const orderable = products.filter((p) => p.stock > 0);
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-bark-100 pb-3">
      {farm ? (
        <Link href={`/farms/${farm.slug}`} className="min-w-0 truncate text-[15px] font-bold text-bark-900 hover:text-leaf-700">
          {farm.name}
        </Link>
      ) : (
        <span className="text-[15px] font-bold text-bark-900">로컬맘</span>
      )}
      <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-bark-600">
        <span className="flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-leaf-700" aria-hidden />
          {temp}
        </span>
        {(arrival || orderable.length > 0) && (
          <>
            <span className="text-bark-300" aria-hidden>
              ·
            </span>
            <span className="whitespace-nowrap font-semibold text-leaf-800">
              {arrival ?? (
                <>
                  <EtaDate products={orderable} /> 도착
                </>
              )}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
