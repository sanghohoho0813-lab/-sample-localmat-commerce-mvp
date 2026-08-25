import { formatWon } from "@/lib/format";

export default function PriceSummary({
  itemsTotal,
  shippingFee,
  couponDiscount = 0,
}: {
  itemsTotal: number;
  shippingFee: number;
  couponDiscount?: number;
}) {
  const total = itemsTotal + shippingFee - couponDiscount;
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between text-bark-600">
        <span>상품금액</span>
        <span className="font-medium text-bark-800">{formatWon(itemsTotal)}</span>
      </div>
      <div className="flex justify-between text-bark-600">
        <span>배송비</span>
        <span className="font-medium text-bark-800">
          {shippingFee === 0 ? "무료" : formatWon(shippingFee)}
        </span>
      </div>
      {couponDiscount > 0 && (
        <div className="flex justify-between text-bark-600">
          <span>쿠폰 할인</span>
          <span className="font-medium text-tangerine-600">-{formatWon(couponDiscount)}</span>
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-bark-100 pt-3">
        <span className="font-bold text-bark-900">총 결제 금액</span>
        <span className="text-xl font-extrabold text-tangerine-600">{formatWon(total)}</span>
      </div>
    </div>
  );
}
