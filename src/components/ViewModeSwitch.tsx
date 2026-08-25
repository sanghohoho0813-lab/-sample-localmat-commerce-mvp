"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import {
  VIEW_MODE_KEY,
  applyViewMode,
  isRealMobileDevice,
  type ViewMode,
} from "@/lib/viewMode";

const MobilePreview = dynamic(() => import("@/components/MobilePreview"), { ssr: false });

/**
 * 뷰 모드 전환 컨트롤.
 *
 * - 실제 스마트폰: "PC 버전으로 보기" ↔ "모바일 버전으로 보기"
 *   viewport meta 폭을 1280px로 바꿔 브라우저가 데스크톱 레이아웃을 그대로 렌더링합니다.
 * - PC: "스마트폰에서 보기"
 *   현재 페이지를 기기 목업 iframe으로 띄워 모바일 UX를 그대로 확인합니다.
 *
 * iframe 안(미리보기 내부)에서는 중첩을 막기 위해 렌더링하지 않습니다.
 */
export default function ViewModeSwitch({
  variant = "inline",
}: {
  /** `header`: 데스크톱 헤더의 아이콘 버튼 / `inline`: 푸터 하단 스트립의 텍스트 버튼 */
  variant?: "header" | "inline";
}) {
  const [mounted, setMounted] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [realMobile, setRealMobile] = useState(false);
  const [mode, setMode] = useState<ViewMode>("mobile");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
    setRealMobile(isRealMobileDevice());
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(VIEW_MODE_KEY);
    } catch {
      /* 사생활 보호 모드 등에서 읽기 실패는 기본값(모바일)으로 처리 */
    }
    const next: ViewMode = stored === "desktop" ? "desktop" : "mobile";
    setMode(next);
    // 하이드레이션 이후 meta 상태를 저장값과 다시 맞춰 중복/불일치를 정리합니다.
    applyViewMode(next);
    setMounted(true);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ViewMode = prev === "desktop" ? "mobile" : "desktop";
      applyViewMode(next);
      try {
        localStorage.setItem(VIEW_MODE_KEY, next);
      } catch {
        /* 사생활 보호 모드 등에서 저장 실패는 무시 */
      }
      // 데스크톱 폭으로 전환하면 가로 스크롤이 남을 수 있어 좌측 정렬로 되돌립니다.
      window.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
      return next;
    });
  }, []);

  if (!mounted || embedded) return null;
  // 헤더 아이콘 버튼은 PC 전용입니다. 실제 스마트폰에서는 푸터 하단 스트립만 노출해
  // 장바구니·상품상세의 Sticky 구매 CTA와 겹치지 않게 합니다.
  if (variant === "header" && realMobile) return null;

  const label = realMobile
    ? mode === "desktop"
      ? "모바일 버전으로 보기"
      : "PC 버전으로 보기"
    : "스마트폰에서 보기";
  const Icon = realMobile ? (mode === "desktop" ? Smartphone : Monitor) : Smartphone;
  const onClick = realMobile ? toggleMode : () => setPreviewOpen(true);

  const button =
    variant === "header" ? (
      <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className="hidden h-10 items-center gap-1.5 rounded-full px-2.5 text-bark-700 transition-colors duration-200 hover:bg-cream-100 hover:text-leaf-700 focus-ring md:flex"
      >
        <Icon className="h-[22px] w-[22px]" />
        <span className="hidden text-[13px] font-medium xl:inline">{label}</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-11 items-center gap-2 rounded-pill border border-bark-200 bg-white px-4 text-[13px] font-semibold text-bark-700 transition-colors duration-200 hover:border-leaf-400 hover:text-leaf-700 focus-ring"
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );

  return (
    <>
      {button}
      {previewOpen && (
        <Suspense fallback={null}>
          <MobilePreview onClose={() => setPreviewOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
