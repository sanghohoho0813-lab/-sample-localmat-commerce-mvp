"use client";

import type { Product } from "@/lib/types";
import { planDelivery, planForProducts, timeLeft } from "@/lib/delivery";
import { kstNow, relativeDay, relativeDayShort } from "@/lib/kst";

/** 마감이 이만큼 넘게 남았으면 카운트다운 대신 '오늘 오후 2시까지'로 — 밤에 "13시간 11분"은 오히려 헷갈립니다. */
const COUNTDOWN_WINDOW_MS = 6 * 60 * 60 * 1000;
import { useNow } from "@/lib/useNow";

type Shippable = Pick<Product, "temp" | "leadDays">;

/** 상품 카드용 짧은 도착 예정 — "내일 도착" */
export function EtaShort({ product, className = "" }: { product: Shippable; className?: string }) {
  const now = useNow();
  // 시각을 알기 전(서버 렌더)에는 자리만 잡아 줄 높이가 흔들리지 않게 합니다.
  if (!now) return <span className={`inline-block w-14 ${className}`} aria-hidden />;
  const plan = planDelivery(product, now);
  return <span className={className}>{relativeDayShort(plan.arriveDate, kstNow(now).date)} 도착</span>;
}

/**
 * 상세·장바구니용 도착 안내 — 오늘 출고 마감 전이면 남은 시간까지.
 * "2시간 13분 안에 주문하면 내일(수) 도착" / "지금 주문하면 10/20(화) 도착"
 */
export function EtaLine({
  products,
  className = "",
  tone = "default",
}: {
  products: readonly Shippable[];
  className?: string;
  /** 어두운 사진 위(모바일 히어로)에서는 밝은 강조색 */
  tone?: "default" | "onDark";
}) {
  const now = useNow();
  if (!now) return <span className={`inline-block h-[1.2em] w-48 rounded bg-current opacity-10 ${className}`} aria-hidden />;
  const plan = planForProducts(products, now);
  if (!plan) return null;
  const arrive = relativeDay(plan.arriveDate, kstNow(now).date);
  const timeTone = tone === "onDark" ? "text-tangerine-200 md:text-tangerine-700" : "text-tangerine-700";
  const dayTone = tone === "onDark" ? "text-white md:text-leaf-800" : "text-leaf-800";
  return (
    <span className={className}>
      {plan.orderBy && plan.orderBy.getTime() - now.getTime() > COUNTDOWN_WINDOW_MS ? (
        <>
          오늘 <b className={`font-bold ${timeTone}`}>오후 2시까지</b> 주문하면{" "}
          <b className={`whitespace-nowrap font-bold ${dayTone}`}>{arrive} 도착</b>
        </>
      ) : plan.orderBy ? (
        <>
          <b className={`font-bold ${timeTone}`}>{timeLeft(plan.orderBy, now)}</b> 안에 주문하면{" "}
          <b className={`whitespace-nowrap font-bold ${dayTone}`}>{arrive} 도착</b>
        </>
      ) : (
        <>
          지금 주문하면 <b className={`whitespace-nowrap font-bold ${dayTone}`}>{arrive} 도착</b>
        </>
      )}
    </span>
  );
}

/** 도착 날짜만 — "내일(수)" (주문서 그룹·요약용) */
export function EtaDate({ products }: { products: readonly Shippable[] }) {
  const now = useNow();
  if (!now) return <span className="inline-block w-14" aria-hidden />;
  const plan = planForProducts(products, now);
  return plan ? <>{relativeDay(plan.arriveDate, kstNow(now).date)}</> : null;
}
