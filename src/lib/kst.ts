/**
 * 한국 시간(KST) 달력 계산 — 서버가 UTC든 사용자가 해외에 있든 '오늘'·'오후 2시'는 한국 기준입니다.
 * 날짜는 시간대 없는 달력 날짜(YMD)로만 다뤄 서머타임·시간대 차이에 흔들리지 않게 합니다.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface YMD {
  y: number;
  m: number; // 1~12
  d: number;
  /** 0=일 ~ 6=토 */
  dow: number;
}

export function kstNow(now: Date = new Date()) {
  const k = new Date(now.getTime() + KST_OFFSET_MS);
  return {
    date: toYMD(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate())),
    hour: k.getUTCHours(),
    minute: k.getUTCMinutes(),
  };
}

function toYMD(utcMidnight: number): YMD {
  const d = new Date(utcMidnight);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay() };
}

export function addDays(day: YMD, n: number): YMD {
  return toYMD(Date.UTC(day.y, day.m - 1, day.d) + n * DAY_MS);
}

export function diffDays(a: YMD, b: YMD): number {
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / DAY_MS);
}

export function compareYMD(a: YMD, b: YMD): number {
  return diffDays(b, a);
}

/** "2026-10-14" */
export function isoDate(day: YMD): string {
  return `${day.y}-${String(day.m).padStart(2, "0")}-${String(day.d).padStart(2, "0")}`;
}

export function parseIsoDate(iso: string): YMD {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return toYMD(Date.UTC(y, m - 1, d));
}

/** 한국 시간 그날 hh:00의 실제 시각 */
export function kstInstant(day: YMD, hour: number): Date {
  return new Date(Date.UTC(day.y, day.m - 1, day.d, hour) - KST_OFFSET_MS);
}

/** "10/14(수)" */
export function shortDay(day: YMD): string {
  return `${day.m}/${day.d}(${DAY_NAMES[day.dow]})`;
}

/** 카드처럼 좁은 곳용 — "오늘", "내일", "모레", "10/16" */
export function relativeDayShort(day: YMD, today: YMD): string {
  const diff = diffDays(today, day);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === 2) return "모레";
  return `${day.m}/${day.d}`;
}

/** 오늘 기준 사람이 읽기 쉬운 날짜 — "오늘", "내일(수)", "10/16(금)" */
export function relativeDay(day: YMD, today: YMD): string {
  const diff = diffDays(today, day);
  if (diff === 0) return `오늘(${DAY_NAMES[day.dow]})`;
  if (diff === 1) return `내일(${DAY_NAMES[day.dow]})`;
  if (diff === 2) return `모레(${DAY_NAMES[day.dow]})`;
  return shortDay(day);
}
