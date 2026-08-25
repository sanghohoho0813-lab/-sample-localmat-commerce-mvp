"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useToastStore } from "@/lib/store";

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl bg-bark-800/95 px-4 py-3 text-sm text-white shadow-lift backdrop-blur animate-toast-in"
          role="status"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-300" />
          <span className="flex-1">{t.message}</span>
          {t.actionHref && t.actionLabel && (
            <Link
              href={t.actionHref}
              onClick={() => dismiss(t.id)}
              className="shrink-0 font-bold text-tangerine-300 hover:text-tangerine-200"
            >
              {t.actionLabel}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
