import type { Order } from "@/lib/types";

const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/**
 * 진행 중인 샘플 주문은 날짜를 오늘 기준(어제 주문 · 내일 도착)으로 맞춥니다.
 * 고정 날짜로 두면 몇 주 전 주문이 아직 '배송중'으로 보여 고장 난 것처럼 보입니다.
 * (이 값을 쓰는 화면은 모두 하이드레이션 후에만 그리므로 서버/클라이언트 날짜 차이가 없습니다.)
 */
export function withLiveDates(order: Order, now: Date = new Date()): Order {
  if (order.status === "delivered" || order.status === "cancelled") return order;
  const created = new Date(order.createdAt);
  created.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const arrive = new Date(now);
  arrive.setDate(now.getDate() + 1);
  const arriveYmd = ymd(arrive);
  return {
    ...order,
    createdAt: created.toISOString(),
    orderNumber: `LM${ymd(created)}-${order.orderNumber.split("-").pop()}`,
    expectedDelivery: `${arriveYmd.slice(0, 4)}-${arriveYmd.slice(4, 6)}-${arriveYmd.slice(6)}`,
  };
}

/** 방금 결제한 주문인지 — 주문 완료 화면의 축하 문구는 이때만 보여 줍니다. */
export function isFreshOrder(order: Order, now: number = Date.now()): boolean {
  return !order.id.startsWith("seed-") && now - new Date(order.createdAt).getTime() < 30 * 60 * 1000;
}
