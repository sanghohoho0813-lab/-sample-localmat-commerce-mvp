"use client";

import Link from "next/link";
import { Snowflake, Sun, Thermometer } from "lucide-react";
import type { Product, ShippingTemp } from "@/lib/types";
import { getFarm } from "@/lib/data/farms";
import { EtaDate } from "@/components/DeliveryEta";
import FarmImage from "@/components/FarmImage";

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
    <div className="flex items-center gap-3 border-b border-bark-100 pb-3">
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-cream-200" aria-hidden>
        {farm && <FarmImage farm={farm} sizes="36px" />}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        {farm ? (
          <Link href={`/farms/${farm.slug}`} className="block truncate text-[15px] font-bold text-bark-900 hover:text-leaf-700">
            {farm.name}
          </Link>
        ) : (
          <span className="block text-[15px] font-bold text-bark-900">로컬맘</span>
        )}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-bark-600">
          <span className="inline-flex items-center gap-1">
            <Icon className="h-3.5 w-3.5 text-leaf-700" aria-hidden />
            {temp} 포장
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
        </p>
      </div>
    </div>
  );
}
