"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
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
          className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-bark-900/95 pr-2 text-white shadow-lift backdrop-blur animate-toast-in ${
            t.thumb ? "py-2.5 pl-2.5" : "py-3 pl-4"
          }`}
        >
          {t.thumb ? (
            // 무엇이 담겼는지 사진으로 — 글자를 읽지 않아도 알 수 있게
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/10">
              <Image src={t.thumb} alt="" fill sizes="44px" className="object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-bark-900">
                {t.tone === "info" ? (
                  <Info className="h-3.5 w-3.5 text-tangerine-300" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-leaf-300" aria-hidden />
                )}
              </span>
            </span>
          ) : t.tone === "info" ? (
            <Info className="h-5 w-5 shrink-0 text-tangerine-300" aria-hidden />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-300" aria-hidden />
          )}
          <span className="min-w-0 flex-1 leading-snug">
            <span className="block text-[16px] font-medium">{t.message}</span>
            {t.detail && <span className="mt-0.5 block truncate text-sm text-white/70">{t.detail}</span>}
          </span>
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
