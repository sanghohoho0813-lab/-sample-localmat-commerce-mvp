import { describe, expect, it } from "vitest";
import { isoDate, kstNow, relativeDay } from "./kst";
import { planDelivery, planForProducts, shippingPolicy, timeLeft } from "./delivery";

// 한국 시간 기준 시각을 만드는 도우미 — 서버 시간대와 상관없이 같은 결과여야 합니다.
const kst = (iso: string) => new Date(`${iso}+09:00`);
const chilled = { temp: "냉장" as const };
const ambient = { temp: "상온" as const };

describe("planDelivery", () => {
  it("오후 2시 전 주문은 오늘 출고, 내일 도착", () => {
    const plan = planDelivery(ambient, kst("2026-10-13T10:00:00")); // 화
    expect(isoDate(plan.shipDate)).toBe("2026-10-13");
    expect(isoDate(plan.arriveDate)).toBe("2026-10-14");
    expect(plan.orderBy?.toISOString()).toBe("2026-10-13T05:00:00.000Z"); // 14:00 KST
  });

  it("오후 2시가 지나면 다음 출고일", () => {
    const plan = planDelivery(ambient, kst("2026-10-13T14:00:00"));
    expect(isoDate(plan.shipDate)).toBe("2026-10-14");
    expect(plan.orderBy).toBeNull();
  });

  it("냉장은 금요일에 출고하지 않는다 — 목요일 오후 주문은 월요일 출고", () => {
    const plan = planDelivery(chilled, kst("2026-10-15T15:00:00")); // 목 오후
    expect(isoDate(plan.shipDate)).toBe("2026-10-19"); // 월
    expect(isoDate(plan.arriveDate)).toBe("2026-10-20");
  });

  it("상온은 금요일 출고, 토요일 도착", () => {
    const plan = planDelivery(ambient, kst("2026-10-16T09:00:00")); // 금 오전
    expect(isoDate(plan.arriveDate)).toBe("2026-10-17");
  });

  it("주말 주문은 월요일 출고", () => {
    expect(isoDate(planDelivery(ambient, kst("2026-10-17T11:00:00")).shipDate)).toBe("2026-10-19");
  });

  it("준비일(도정·제조)만큼 늦게 출고", () => {
    const plan = planDelivery({ temp: "상온", leadDays: 1 }, kst("2026-10-13T09:00:00"));
    expect(isoDate(plan.shipDate)).toBe("2026-10-14");
    expect(plan.orderBy).toBeNull();
  });

  it("서버가 UTC여도 한국 날짜로 계산 — UTC로는 전날 밤인 KST 새벽", () => {
    const now = new Date("2026-10-12T16:30:00Z"); // KST 10/13(화) 01:30
    expect(isoDate(kstNow(now).date)).toBe("2026-10-13");
    expect(isoDate(planDelivery(ambient, now).arriveDate)).toBe("2026-10-14");
  });
});

describe("planForProducts", () => {
  it("함께 주문하면 가장 늦은 상품 기준", () => {
    const plan = planForProducts([ambient, chilled], kst("2026-10-15T15:00:00"));
    expect(isoDate(plan!.arriveDate)).toBe("2026-10-20");
  });
  it("빈 주문은 일정 없음", () => expect(planForProducts([])).toBeNull());
});

describe("표기", () => {
  it("오늘·내일·모레·날짜", () => {
    const today = kstNow(kst("2026-10-13T10:00:00")).date;
    const plan = planDelivery(ambient, kst("2026-10-13T10:00:00"));
    expect(relativeDay(plan.arriveDate, today)).toBe("내일(수)");
    expect(relativeDay(planDelivery(chilled, kst("2026-10-15T15:00:00")).arriveDate, today)).toBe("10/20(화)");
  });
  it("남은 시간", () => {
    expect(timeLeft(kst("2026-10-13T14:00:00"), kst("2026-10-13T11:47:30"))).toBe("2시간 12분");
    expect(timeLeft(kst("2026-10-13T14:00:00"), kst("2026-10-13T13:20:00"))).toBe("40분");
  });
  it("배송 안내 문장은 온도·준비일을 반영", () => {
    expect(shippingPolicy(chilled).join(" ")).toContain("금요일");
    expect(shippingPolicy({ temp: "상온", leadDays: 1 }).join(" ")).toContain("1일");
  });
});
