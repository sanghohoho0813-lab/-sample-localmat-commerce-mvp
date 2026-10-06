"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

/**
 * 화면을 그리다 예기치 못한 오류가 나면 흰 화면 대신 이 안내를 보여 줍니다.
 * 헤더·하단 탭은 그대로라 다른 곳으로 이동할 수 있고, '다시 시도'는 이 화면만 다시 그립니다.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-20 text-center md:py-24" role="alert">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-200 text-bark-400">
        <TriangleAlert className="h-9 w-9" strokeWidth={1.8} />
      </span>
      <h1 className="mt-5 text-lg font-extrabold text-bark-900">화면을 불러오지 못했어요</h1>
      <p className="mt-1.5 text-[16px] text-bark-500">잠시 후 다시 시도해 주세요. 장바구니에 담은 상품은 그대로 있어요.</p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary h-12 px-6 text-[16px]">
          <RotateCcw className="h-4 w-4" />
          다시 시도
        </button>
        <Link href="/" className="btn-outline h-12 px-6 text-[16px]">
          홈으로 가기
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-sm text-bark-400">오류 코드 {error.digest}</p>}
    </div>
  );
}
