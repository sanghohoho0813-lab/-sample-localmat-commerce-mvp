import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/types";
import { itemLabel } from "./format";
import { isFreshOrder, withLiveDates } from "./orders";

const base: Order = {
  id: "seed-o05",
  orderNumber: "LM20260822-0412",
  createdAt: "2026-08-22T10:24:00+09:00",
  status: "shipping",
  items: [],
  itemsTotal: 0,
  shippingFee: 0,
  couponDiscount: 0,
  totalAmount: 0,
  paymentMethod: "card",
  recipient: "",
  phone: "",
  address: "",
  expectedDelivery: "2026-08-25",
};

describe("withLiveDates", () => {
  const now = new Date(2026, 9, 6, 12, 0); // 2026-10-06
  it("진행 중인 주문은 어제 주문·내일 도착으로 맞춘다", () => {
    const live = withLiveDates(base, now);
    expect(new Date(live.createdAt).getDate()).toBe(5);
    expect(live.expectedDelivery).toBe("2026-10-07");
    expect(live.orderNumber).toBe("LM20261005-0412");
  });
  it("월말·연말 경계도 넘어간다", () => {
    expect(withLiveDates(base, new Date(2026, 11, 31, 9)).expectedDelivery).toBe("2027-01-01");
  });
  it("끝난 주문은 그대로 둔다", () => {
    const done = { ...base, status: "delivered" as const };
    expect(withLiveDates(done, now)).toBe(done);
  });
});

describe("isFreshOrder", () => {
  const now = Date.parse("2026-10-06T03:00:00Z");
  it("방금(30분 이내) 결제한 주문만", () => {
    expect(isFreshOrder({ ...base, id: "o-1", createdAt: "2026-10-06T02:50:00Z" }, now)).toBe(true);
    expect(isFreshOrder({ ...base, id: "o-1", createdAt: "2026-10-06T02:00:00Z" }, now)).toBe(false);
  });
  it("샘플 주문은 축하 화면을 보여 주지 않는다", () => {
    expect(isFreshOrder({ ...base, createdAt: "2026-10-06T02:59:00Z" }, now)).toBe(false);
  });
});

describe("itemLabel", () => {
  it("크기 옵션은 단위를 대신한다", () => {
    expect(itemLabel("논산 설향 딸기", "500g", "1kg (2팩)")).toEqual({ title: "논산 설향 딸기 1kg (2팩)", option: undefined });
  });
  it("그 밖의 옵션은 따로 둔다", () => {
    expect(itemLabel("한돈 삼겹살", "500g", "구이용")).toEqual({ title: "한돈 삼겹살 500g", option: "구이용" });
  });
});
