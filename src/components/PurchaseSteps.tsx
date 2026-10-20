import { Check, ChevronRight } from "lucide-react";

const STEPS = ["장바구니", "주문서", "주문 완료"] as const;

/** 구매 단계 — 장바구니 → 주문서 → 주문 완료. 지금 어디쯤인지 늘 보이게 합니다. */
export default function PurchaseSteps({ current, className = "" }: { current: 0 | 1 | 2; className?: string }) {
  return (
    <ol aria-label="주문 단계" className={`flex items-center gap-1 text-[13px] sm:gap-1.5 sm:text-sm ${className}`}>
      {STEPS.map((step, i) => (
        <li key={step} className="flex items-center gap-1 whitespace-nowrap sm:gap-1.5" aria-current={i === current ? "step" : undefined}>
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold tabular-nums sm:h-5 sm:w-5 sm:text-[12px] ${
              i < current ? "bg-leaf-100 text-leaf-700" : i === current ? "bg-leaf-700 text-white" : "bg-bark-100 text-bark-500"
            }`}
            aria-hidden
          >
            {i < current ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
          </span>
          <span className={i === current ? "font-bold text-bark-900" : "text-bark-500"}>{step}</span>
          {i < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-bark-300" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
