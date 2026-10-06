"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useToastStore } from "@/lib/store";

/**
 * 토스트 표시 영역.
 * - 모바일: 화면 위쪽. 아래쪽은 하단 탭·구매 버튼 바·공용 뒤로 버튼이 쓰고 있어
 *   거기에 띄우면 방금 누른 버튼이나 '보러가기'가 가려집니다.
 * - PC: 화면 아래 가운데.
 */
export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8 md:top-auto"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-bark-900/95 py-3 pl-4 pr-2 text-white shadow-lift backdrop-blur animate-toast-in"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-300" />
          <span className="min-w-0 flex-1 text-[16px] font-medium leading-snug">{t.message}</span>
          {t.action &&
            (t.action.href ? (
              <Link
                href={t.action.href}
                onClick={() => dismiss(t.id)}
                className="flex h-10 shrink-0 items-center rounded-xl px-3 text-[16px] font-bold text-tangerine-300 transition-colors hover:bg-white/10"
              >
                {t.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  dismiss(t.id);
                }}
                className="flex h-10 shrink-0 items-center rounded-xl px-3 text-[16px] font-bold text-tangerine-300 transition-colors hover:bg-white/10"
              >
                {t.action.label}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
