import { Check, CreditCard, PackageCheck, Sprout, Truck } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const STEPS = [
  { key: "paid", label: "주문접수", icon: CreditCard },
  { key: "preparing", label: "상품준비", icon: Sprout },
  { key: "shipping", label: "배송중", icon: Truck },
  { key: "delivered", label: "배송완료", icon: PackageCheck },
] as const;

/** 상태별로 몇 번째 단계까지 왔는지 (pending/paid = 0단계) */
const STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  paid: 0,
  preparing: 1,
  shipping: 2,
  delivered: 3,
  cancelled: -1,
};

/**
 * 주문 배송 진행 스테퍼.
 * 주문접수 → 상품준비 → 배송중 → 배송완료 흐름을 한눈에 보여줍니다.
 */
export default function OrderProgress({ status }: { status: OrderStatus }) {
  const current = STEP_INDEX[status];

  if (current < 0) {
    return (
      <p className="rounded-card bg-bark-100 px-4 py-3 text-center text-sm font-medium text-bark-500">
        취소된 주문입니다.
      </p>
    );
  }

  return (
    <ol className="flex items-start" aria-label="배송 진행 상태">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <li key={step.key} className="flex min-w-0 flex-1 flex-col items-center">
            {/* 아이콘 + 좌우 연결선 */}
            <div className="flex w-full items-center">
              <span
                className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : done || active ? "bg-leaf-500" : "bg-bark-200"}`}
              />
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                  done
                    ? "border-leaf-500 bg-leaf-500 text-white"
                    : active
                      ? "border-leaf-500 bg-white text-leaf-600"
                      : "border-bark-200 bg-white text-bark-300"
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span
                className={`h-0.5 flex-1 ${
                  i === STEPS.length - 1 ? "bg-transparent" : done ? "bg-leaf-500" : "bg-bark-200"
                }`}
              />
            </div>
            <span
              className={`mt-2 truncate px-0.5 text-center text-xs ${
                active ? "font-bold text-leaf-700" : done ? "font-medium text-bark-600" : "text-bark-400"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
