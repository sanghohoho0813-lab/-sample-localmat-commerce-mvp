import { kstNow } from "@/lib/kst";

export function formatPrice(value: number): string {
  return value.toLocaleString("ko-KR");
}

export function formatWon(value: number): string {
  return `${formatPrice(value)}원`;
}

export function discountRate(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** 주문일 등 — 사용자 기기 시간대가 아니라 한국 날짜로(자정 무렵 주문도 진행 단계 날짜와 어긋나지 않게) */
export function formatDate(iso: string): string {
  const { date } = kstNow(new Date(iso));
  return `${date.y}.${String(date.m).padStart(2, "0")}.${String(date.d).padStart(2, "0")}`;
}

/** 주문번호 — 날짜 부분은 한국 날짜(LM20261014-1234) */
export function makeOrderNumber(now: Date): string {
  const { date } = kstNow(now);
  const y = date.y;
  const m = String(date.m).padStart(2, "0");
  const day = String(date.d).padStart(2, "0");
  const seq = String(Math.floor((now.getTime() / 1000) % 10000)).padStart(4, "0");
  return `LM${y}${m}${day}-${seq}`;
}

/**
 * 주문 상품 표기 — 크기·수량 옵션(예: "1kg (2팩)")은 상품 단위를 대신해 이름 뒤에 붙이고,
 * 그 밖의 옵션(예: "구이용")은 따로 보여 줍니다. ("설향 딸기 500g · 1kg (2팩)" 같은 모순을 막습니다.)
 */
export function itemLabel(
  name: string,
  unit: string,
  optionLabel?: string
): { title: string; option?: string } {
  const sizeOption = !!optionLabel && /^\d/.test(optionLabel);
  return {
    title: `${name} ${sizeOption ? optionLabel : unit}`,
    option: sizeOption ? undefined : optionLabel,
  };
}
