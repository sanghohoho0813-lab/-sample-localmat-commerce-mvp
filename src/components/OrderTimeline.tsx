import { Check } from "lucide-react";
import type { Order } from "@/lib/types";
import { addDays, kstNow, parseIsoDate, relativeDay, shortDay } from "@/lib/kst";

/** 주문 상태 → 몇 번째 단계까지 끝났는지 */
const DONE_UNTIL: Record<Order["status"], number> = {
  pending: 0,
  paid: 0,
  preparing: 0,
  shipping: 2,
  delivered: 3,
  cancelled: -1,
};

/** "10/13(화) 11:20" — 한국 시간 */
function time(iso: string) {
  const k = kstNow(new Date(iso));
  return `${shortDay(k.date)} ${String(k.hour).padStart(2, "0")}:${String(k.minute).padStart(2, "0")}`;
}

/**
 * 주문 진행 — 단계마다 날짜(한 일·할 일)를 함께. 실제 택배 연동이 없는 데모라는 점은 아래에 분명히 적습니다.
 */
export default function OrderTimeline({ order }: { order: Order }) {
  const arrive = parseIsoDate(order.expectedDelivery);
  const ship = order.shipDate ? parseIsoDate(order.shipDate) : addDays(arrive, -1);
  const doneUntil = DONE_UNTIL[order.status];
  if (doneUntil < 0) {
    return <p className="rounded-xl bg-bark-100 px-4 py-3 text-center text-sm font-medium text-bark-600">취소된 주문이에요.</p>;
  }

  const steps = [
    { label: "주문 완료", date: time(order.createdAt), note: "결제가 끝났어요." },
    { label: "산지 출고", date: shortDay(ship), note: "농가에서 수확·포장해 오후에 택배로 보내요." },
    { label: "배송 중", date: shortDay(ship), note: "택배사에서 받는 분께 가는 중이에요." },
    { label: order.status === "delivered" ? "도착" : "도착 예정", date: shortDay(arrive), note: "문 앞에 도착하면 바로 냉장 보관해 주세요." },
  ];
  const current = Math.min(doneUntil + 1, steps.length - 1);

  return (
    <div>
      <ol className="relative">
        {steps.map((step, i) => {
          const done = i <= doneUntil;
          const isCurrent = i === current && doneUntil < steps.length - 1;
          return (
            <li key={step.label} className="relative flex gap-3.5 pb-5 last:pb-0">
              {/* 단계 사이 선 */}
              {i < steps.length - 1 && (
                <span
                  className={`absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-0.5 ${i < doneUntil ? "bg-leaf-600" : "bg-bark-200"}`}
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-leaf-600 bg-leaf-600 text-white"
                    : isCurrent
                      ? "border-leaf-600 bg-white"
                      : "border-bark-200 bg-white"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : isCurrent && <span className="h-2.5 w-2.5 rounded-full bg-leaf-600" />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={`text-[16px] font-bold ${done || isCurrent ? "text-bark-900" : "text-bark-500"}`}>
                    {step.label}
                  </span>
                  <span className={`text-sm ${done ? "text-bark-600" : "text-bark-500"}`}>
                    {step.date}
                    {!done && " 예정"}
                  </span>
                </p>
                {(isCurrent || (done && i === doneUntil)) && <p className="mt-0.5 text-sm text-bark-600">{step.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {order.status !== "delivered" && (
        <p className="mt-4 border-t border-bark-100 pt-3 text-xs text-bark-500">
          데모 주문이라 배송 단계가 실제로 바뀌지는 않아요. 날짜는 실제 출고 규칙(오후 2시 마감·주말 미출고)으로 계산했어요.
        </p>
      )}
    </div>
  );
}

const SUMMARY_STEPS = ["주문 완료", "산지 출고", "배송 중", "도착"];

/**
 * 배송 요약 카드 — 언제 오는지 한눈에(큰 날짜) + 지금 몇 단계인지(가로 막대).
 * 자세한 날짜는 아래 '주문 진행'에 있습니다. 저장값을 읽은 뒤(클라이언트)에만 그려 '내일' 같은 상대 날짜가 정확합니다.
 */
export function DeliverySummary({ order }: { order: Order }) {
  const doneUntil = DONE_UNTIL[order.status];
  if (doneUntil < 0) return null;
  const arrive = parseIsoDate(order.expectedDelivery);
  const ship = order.shipDate ? parseIsoDate(order.shipDate) : addDays(arrive, -1);
  const delivered = order.status === "delivered";
  const current = Math.min(doneUntil + 1, SUMMARY_STEPS.length - 1);
  return (
    <section className="overflow-hidden rounded-2xl bg-leaf-900 p-5 text-white md:p-6" aria-label="배송 요약">
      <p className="text-sm font-medium text-white/75">{delivered ? "배송 완료" : "도착 예정"}</p>
      <p className="mt-0.5 text-[28px] font-bold leading-tight tracking-tight">
        {delivered ? shortDay(arrive) : relativeDay(arrive, kstNow().date)}
      </p>
      <p className="mt-1 text-sm text-white/80">
        {delivered ? "문 앞에 도착했어요. 냉장 보관을 확인해 주세요." : `${shortDay(ship)} 산지에서 출고해 다음 날 도착해요.`}
      </p>
      <div className="mt-5" role="img" aria-label={`${SUMMARY_STEPS.length}단계 중 ${doneUntil + 1}단계 완료`}>
        <div className="grid grid-cols-4 gap-1.5">
          {SUMMARY_STEPS.map((step, i) => (
            <span
              key={step}
              className={`h-1.5 rounded-full ${
                i <= doneUntil ? "bg-leaf-300" : i === current ? "bg-white/50 motion-safe:animate-pulse" : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 text-xs">
          {SUMMARY_STEPS.map((step, i) => (
            <span key={step} className={i <= doneUntil || i === current ? "font-semibold text-white" : "text-white/70"}>
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
