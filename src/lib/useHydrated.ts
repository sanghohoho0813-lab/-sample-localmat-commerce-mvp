"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * 브라우저 저장소(localStorage)에 기대는 화면이 서버 HTML과 다르게 그려지는 것을 막는 가드.
 *
 * - 서버 렌더·하이드레이션 중: false → 저장값 없이(또는 자리표시로) 그립니다.
 * - 하이드레이션이 끝난 뒤, 그리고 클라이언트 이동으로 새로 열린 화면: 처음부터 true
 *   → `useState + useEffect(setMounted)` 방식과 달리 화면을 옮길 때마다 빈 화면이 한 번씩 깜빡이지 않습니다.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
