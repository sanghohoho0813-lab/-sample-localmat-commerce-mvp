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

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export function expectedDeliveryDate(daysFromNow = 1): { iso: string; label: string } {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  // Skip Sunday for delivery
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  const iso = d.toISOString().slice(0, 10);
  const label = `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
  return { iso, label };
}

export function makeOrderNumber(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor((now.getTime() / 1000) % 10000)).padStart(4, "0");
  return `LM${y}${m}${day}-${seq}`;
}
