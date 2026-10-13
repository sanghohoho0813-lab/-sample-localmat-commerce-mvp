/**
 * 배송 일정 — 출고 마감·출고 요일·준비일로 '언제 도착하는지'를 계산합니다.
 *
 * 규칙 (상세 화면 '배송' 안내와 같은 내용)
 * - 한국 시간 오후 2시까지 주문하면 그날 산지에서 출고, 다음 날 도착
 * - 냉장·냉동은 월~목만 출고 — 금요일에 보내면 주말 내내 택배 창고에 머물러 신선도가 떨어지므로
 * - 상온은 월~금 출고
 * - 도정·제조처럼 준비가 필요한 상품은 그만큼(leadDays) 늦게 출고
 */
import type { Product, ShippingTemp } from "@/lib/types";
import { type YMD, addDays, compareYMD, kstInstant, kstNow } from "@/lib/kst";

export const CUTOFF_HOUR = 14;

export function shipsOn(temp: ShippingTemp, dow: number): boolean {
  return temp === "상온" ? dow >= 1 && dow <= 5 : dow >= 1 && dow <= 4;
}

export interface DeliveryPlan {
  shipDate: YMD;
  arriveDate: YMD;
  /** 오늘 출고에 맞추려면 이 시각까지 주문 — 오늘 출고가 안 되면 null */
  orderBy: Date | null;
}

export function planDelivery(product: Pick<Product, "temp" | "leadDays">, now: Date = new Date()): DeliveryPlan {
  const { date: today, hour } = kstNow(now);
  const lead = product.leadDays ?? 0;
  let ship = addDays(today, (hour < CUTOFF_HOUR ? 0 : 1) + lead);
  while (!shipsOn(product.temp, ship.dow)) ship = addDays(ship, 1);
  const shipsToday = compareYMD(ship, today) === 0;
  return {
    shipDate: ship,
    arriveDate: addDays(ship, 1),
    orderBy: shipsToday ? kstInstant(today, CUTOFF_HOUR) : null,
  };
}

/** 여러 상품을 한 번에 주문할 때 — 가장 늦게 도착하는 상품 기준 */
export function planForProducts(
  items: readonly Pick<Product, "temp" | "leadDays">[],
  now: Date = new Date()
): DeliveryPlan | null {
  if (items.length === 0) return null;
  return items
    .map((p) => planDelivery(p, now))
    .reduce((latest, plan) => (compareYMD(plan.arriveDate, latest.arriveDate) > 0 ? plan : latest));
}

/** 마감까지 남은 시간 — "2시간 13분", "45분" */
export function timeLeft(until: Date, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.floor((until.getTime() - now.getTime()) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

/** 상세 '배송' 안내 문장 */
export function shippingPolicy(product: Pick<Product, "temp" | "leadDays">): string[] {
  const lines =
    product.temp === "상온"
      ? ["평일 오후 2시까지 주문하면 그날 산지에서 출고해 다음 날 도착해요."]
      : [
          `${product.temp} 상품은 월~목 오후 2시까지 주문하면 당일 출고, 다음 날 도착해요.`,
          "금요일·주말에는 출고하지 않아요 — 택배 창고에서 주말을 보내면 신선도가 떨어지기 때문이에요.",
        ];
  if (product.leadDays) lines.push(`주문을 받은 뒤 준비(도정·제조)에 ${product.leadDays}일이 더 걸려요.`);
  return lines;
}
