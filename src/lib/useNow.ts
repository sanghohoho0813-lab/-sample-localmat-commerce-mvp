"use client";

import { useSyncExternalStore } from "react";

/**
 * 지금 시각(분 단위) — 도착 예정일·주문 마감 카운트다운처럼 시간에 따라 바뀌는 표시용.
 *
 * - 서버 렌더·하이드레이션 중에는 null → 빌드 때 계산한 날짜가 HTML에 굳어 버리는 일이 없습니다.
 *   (정적 페이지에 '내일 도착'을 그려 두면 며칠 뒤 열어도 그 날짜가 보이고 하이드레이션 경고가 납니다.)
 * - 분이 바뀔 때만 다시 그려서 카운트다운이 살아 있되 화면이 자주 흔들리지 않게 합니다.
 * - 화면의 모든 시계가 타이머 하나를 함께 씁니다.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let lastMinute = 0;

function currentMinute() {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    lastMinute = currentMinute();
    timer = setInterval(() => {
      const minute = currentMinute();
      if (minute !== lastMinute) {
        lastMinute = minute;
        listeners.forEach((l) => l());
      }
    }, 15_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => 0);
  return minute === 0 ? null : new Date(minute);
}
