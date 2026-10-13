"use client";

import { useEffect, useState } from "react";

/**
 * 지금 화면에서 읽고 있는 구역 — 상세의 구역 바로가기(상품정보·생산자·배송·후기)에 현재 위치를 표시합니다.
 * 구역마다 걸어 둔 scroll-margin-top(헤더·바로가기 바 높이)을 기준선으로, 그 선에 닿은 마지막 구역을 '지금 구역'으로 봅니다.
 * 바로가기·#주소로 이동했을 때 멈추는 위치와 같은 기준이라 화면 폭(헤더 높이)이 달라도 어긋나지 않습니다.
 */
export function useScrollSpy(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (el.getBoundingClientRect().top - line <= 8) current = id;
      }
      // 페이지 끝까지 내렸으면 마지막 구역
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = ids[ids.length - 1];
        const lastEl = document.getElementById(last);
        if (lastEl && lastEl.getBoundingClientRect().top < window.innerHeight) current = last;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}
