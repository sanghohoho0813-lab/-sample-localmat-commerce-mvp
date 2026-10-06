import { expect, test } from "@playwright/test";
import { addToCartOnDetail, collectConsoleErrors, expectNoHorizontalOverflow } from "./helpers";

test("장바구니 → 주문서 → 결제 → 주문 완료", async ({ page, isMobile }) => {
  const errors = collectConsoleErrors(page);

  await page.goto("/products/handon-samgyeopsal");
  await addToCartOnDetail(page, isMobile);
  await expect(page.getByRole("status").filter({ hasText: "장바구니에 담았어요" })).toBeVisible();

  await page.goto("/products/nonsan-ttalgi");
  await page.getByRole("button", { name: /1kg \(2팩\)/ }).click();
  await addToCartOnDetail(page, isMobile);

  await page.goto("/cart");
  // 크기 옵션은 상품 단위를 대신합니다("500g" + "1kg" 같은 모순 없음)
  await expect(page.getByRole("link", { name: "논산 설향 딸기 1kg (2팩)" })).toBeVisible();

  // 삭제 → 되돌리기 → 원래 자리
  const rows = page.locator("main li").filter({ has: page.getByRole("button", { name: /삭제$/ }) });
  await expect(rows).toHaveCount(2);
  await rows.first().getByRole("button", { name: /삭제$/ }).click();
  await expect(rows).toHaveCount(1);
  await page.getByRole("button", { name: "되돌리기" }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText("삼겹살");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: /주문하기/ }).last().click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: "주문서" })).toBeVisible();

  // 가장 큰 할인 쿠폰이 자동 적용
  await expect(page.locator('input[name="coupon"]:checked')).toHaveCount(1);
  await expect(page.getByText("쿠폰 사용 안 함").locator("..").locator("input")).not.toBeChecked();

  // 직접 입력을 비워 두면 결제되지 않고 바로 아래에 안내
  await page.selectOption("#request", "직접 입력");
  await page.getByRole("button", { name: /결제하기/ }).last().click();
  const requestError = page.locator("#request-error");
  await expect(requestError).toHaveText("요청사항을 입력해 주세요.");
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel("배송 요청사항 직접 입력").fill("공동현관 1234#");
  await expect(requestError).toHaveCount(0);
  await expect(page.getByText("10/50")).toBeVisible();

  // 배송지는 하나만 보이고, 바꿀 때만 펼침
  await page.getByRole("button", { name: "변경" }).click();
  await page.getByRole("radio", { name: /회사/ }).click();
  await expect(page.getByText(/테헤란로/)).toBeVisible();

  await page.getByRole("button", { name: /결제하기/ }).last().click();
  await expect(page).toHaveURL(/\/order-complete\//);
  await expect(page.getByRole("heading", { name: "주문이 완료되었어요!" })).toBeVisible();
  await expect(page.getByText("공동현관 1234#")).toBeVisible();

  // 결제한 주문서로 뒤로 돌아가지 않습니다(이중 주문 방지)
  await page.goBack();
  await expect(page).not.toHaveURL(/\/checkout/);

  expect(errors).toEqual([]);
});

test("바로 구매는 그 상품만 주문하고 장바구니는 그대로 둔다", async ({ page }) => {
  await page.goto("/products/yujeongran-15");
  await page.getByRole("button", { name: "찜하기" }).first().waitFor();
  await page.evaluate(() =>
    localStorage.setItem("localmat-cart", JSON.stringify({ state: { items: [{ productId: "p01", quantity: 1 }] }, version: 1 }))
  );
  await page.goto("/products/jeju-hallabong");
  await page.getByRole("button", { name: /바로 구매/ }).click();
  await expect(page).toHaveURL(/\/checkout\?mode=now/);
  await expect(page.getByText("제주 한라봉 2kg")).toBeVisible();
  await expect(page.getByText("해남 봄동")).toHaveCount(0);

  await page.getByRole("button", { name: /결제하기/ }).last().click();
  await expect(page).toHaveURL(/\/order-complete\//);
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("localmat-cart") ?? "{}").state.items);
  expect(cart).toEqual([{ productId: "p01", quantity: 1 }]);
});

test("재고보다 많이 담을 수 없다", async ({ page, isMobile }) => {
  await page.goto("/products/nonsan-ttalgi-gift"); // 재고 20
  const plus = page.getByRole("button", { name: "수량 늘리기" });
  for (let i = 0; i < 25 && (await plus.isEnabled()); i++) await plus.click();
  await expect(plus).toBeDisabled();
  await expect(page.getByText("한 번에 최대 20개까지 주문할 수 있어요.")).toBeVisible();
  await addToCartOnDetail(page, isMobile);
  await addToCartOnDetail(page, isMobile);
  await expect(page.getByRole("status").last()).toContainText("20개까지만");
});
