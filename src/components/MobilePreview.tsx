"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, RotateCw, X } from "lucide-react";

const DEVICES = [
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-15", label: "iPhone 15", width: 390, height: 844 },
  { id: "iphone-max", label: "15 Pro Max", width: 430, height: 932 },
] as const;

/** 툴바 + 캡션 + 여백이 차지하는 세로 공간 */
const CHROME_HEIGHT = 180;

/**
 * PC에서 현재 페이지를 실제 모바일 레이아웃 그대로 확인하는 미리보기 모달.
 * iframe 폭을 기기 CSS 폭으로 고정하므로 Tailwind 브레이크포인트가 실제 스마트폰과 동일하게 동작합니다.
 *
 * document.body로 포털합니다. 헤더가 backdrop-blur를 쓰는데,
 * backdrop-filter는 position:fixed 자식의 컨테이닝 블록이 되어
 * 헤더 안에서 렌더링하면 모달이 헤더 영역에 갇힙니다.
 */
export default function MobilePreview({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [device, setDevice] = useState<(typeof DEVICES)[number]>(DEVICES[1]);
  const [reloadKey, setReloadKey] = useState(0);
  const [screenHeight, setScreenHeight] = useState<number>(device.height);
  const [portalReady, setPortalReady] = useState(false);

  const query = searchParams.toString();
  const src = `${pathname}${query ? `?${query}` : ""}`;

  useEffect(() => setPortalReady(true), []);

  // 배경 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // 화면이 낮으면 기기 높이를 줄입니다. (축소 변환 대신 높이만 조절해 폰트 크기를 실제와 동일하게 유지)
  useEffect(() => {
    function fit() {
      setScreenHeight(Math.max(420, Math.min(device.height, window.innerHeight - CHROME_HEIGHT)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [device.height]);

  if (!portalReady) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-bark-900/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="스마트폰 화면 미리보기"
    >
      <button type="button" aria-label="닫기" className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* 툴바 */}
      <div className="relative flex shrink-0 flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-pill bg-white/12 p-1 backdrop-blur">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d)}
              className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                device.id === d.id ? "bg-white text-bark-900" : "text-white/80 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex h-9 items-center gap-1.5 rounded-pill bg-white/12 px-3.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <RotateCw className="h-3.5 w-3.5" />
          새로고침
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 items-center gap-1.5 rounded-pill bg-white/12 px-3.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          새 탭
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="미리보기 닫기"
          className="flex h-9 w-9 items-center justify-center rounded-pill bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 기기 목업 */}
      <div className="relative min-h-0 shrink">
        <div className="relative rounded-[44px] border-[3px] border-bark-700 bg-bark-900 p-2.5 shadow-2xl">
          {/* 다이나믹 아일랜드 */}
          <div className="absolute left-1/2 top-[18px] z-10 h-6 w-24 -translate-x-1/2 rounded-pill bg-bark-900" />
          <div
            className="overflow-hidden rounded-[34px] bg-cream-100"
            style={{ width: device.width, height: screenHeight }}
          >
            <iframe
              key={`${device.id}-${reloadKey}-${src}`}
              src={src}
              title="스마트폰 화면 미리보기"
              className="border-0"
              style={{ width: device.width, height: screenHeight }}
            />
          </div>
        </div>
      </div>

      <p className="relative shrink-0 text-xs text-white/70">
        {device.width} × {screenHeight} · 실제 스마트폰과 동일한 레이아웃으로 렌더링됩니다
      </p>
    </div>,
    document.body
  );
}
