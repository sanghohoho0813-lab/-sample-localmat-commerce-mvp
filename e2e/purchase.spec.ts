import { expect, test } from "@playwright/test";
import { addToCartOnDetail, collectConsoleErrors, expectNoHorizontalOverflow } from "./helpers";

test("장바구니 → 주문서 → 결제 → 주문 완료", async ({ page, isMobile }) => {
  const errors = collectConsoleErrors(page);

  await page.goto("/products/handon-samgyeopsal");
  await addToCartOnDetail(page, isMobile);
  await expect(page.getByRole("status").filter({ hasText: "장바구니에 담았어요" })).toBeVisible();

  await page.goto("/products/jeju-gamgyul");
  await page.getByRole("button", { name: /^5kg/ }).click();
  await addToCartOnDetail(page, isMobile);

  await page.goto("/cart");
  // 크기 옵션은 상품 단위를 대신합니다("3kg" + "5kg" 같은 모순 없음)
  await expect(page.getByRole("link", { name: "제주 노지 감귤 5kg" })).toBeVisible();
  // 농가별로 묶어 보여 주고, 무료배송까지 남은 금액·도착 예정을 함께 안내
  await expect(page.getByRole("link", { name: "제주 서귀포 감귤원" }).first()).toBeVisible();

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
  await expect(page.getByRole("heading", { name: "주문이 완료되었어요" })).toBeVisible();
  await expect(page.getByText("공동현관 1234#")).toBeVisible();
  await expect(page.getByRole("heading", { name: "주문 진행" })).toBeVisible();

  // 결제한 주문서로 뒤로 돌아가지 않습니다(이중 주문 방지)
  await page.goBack();
  await expect(page).not.toHaveURL(/\/checkout/);

  expect(errors).toEqual([]);
});

test("바로 구매는 그 상품만 주문하고 장바구니는 그대로 둔다", async ({ page }) => {
  await page.goto("/products/yujeongran-15");
  await page.getByRole("button", { name: "찜하기" }).first().waitFor();
  await page.evaluate(() =>
    localStorage.setItem("localmat-cart", JSON.stringify({ state: { items: [{ productId: "p02", quantity: 1 }] }, version: 1 }))
  );
  await page.goto("/products/jeju-gamgyul");
  await page.getByRole("button", { name: /바로 구매/ }).click();
  await expect(page).toHaveURL(/\/checkout\?mode=now/);
  await expect(page.getByText("제주 노지 감귤 3kg")).toBeVisible();
  await expect(page.getByText("평창 고랭지 감자")).toHaveCount(0);

  await page.getByRole("button", { name: /결제하기/ }).last().click();
  await expect(page).toHaveURL(/\/order-complete\//);
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("localmat-cart") ?? "{}").state.items);
  expect(cart).toEqual([{ productId: "p02", quantity: 1 }]);
});

test("재고보다 많이 담을 수 없다", async ({ page, isMobile }) => {
  await page.goto("/products/wando-jeonbok-gift"); // 재고 25
  const plus = page.getByRole("button", { name: "수량 늘리기" });
  for (let i = 0; i < 30 && (await plus.isEnabled()); i++) await plus.click();
  await expect(plus).toBeDisabled();
  await expect(page.getByText("한 번에 최대 25개까지 주문할 수 있어요.")).toBeVisible();
  await addToCartOnDetail(page, isMobile);
  await addToCartOnDetail(page, isMobile);
  await expect(page.getByRole("status").last()).toContainText("25개까지만");
});

test("제철이 지나 품절인 상품은 담을 수 없고 다음 수확 시기를 알려 준다", async ({ page }) => {
  await page.goto("/products/nonsan-ttalgi");
  await expect(page.getByText("12월 첫 수확 예정").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "장바구니", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /바로 구매/ })).toHaveCount(0);
  // 대신 지금 받아 볼 수 있는 상품을 권합니다
  await expect(page.getByRole("heading", { name: "지금 받아 볼 수 있는 상품" })).toBeVisible();
});

test("지난 주문을 같은 옵션으로 다시 담는다", async ({ page }) => {
  await page.goto("/order-complete/seed-o05");
  await expect(page.getByRole("heading", { name: "주문 상세" })).toBeVisible();
  await page.getByRole("button", { name: "같은 상품 다시 담기" }).click();
  await expect(page.getByRole("status").last()).toContainText("다시 담았어요");
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "제주 노지 감귤 3kg" })).toBeVisible();
  await expect(page.getByRole("link", { name: "자연방사 유정란 15구" })).toBeVisible();
});

test("PC — 상세를 읽다가 오른쪽 구매 상자에서 옵션을 바꿔 담는다", async ({ page, isMobile }) => {
  test.skip(isMobile, "PC 전용");
  await page.goto("/products/jeju-gamgyul");
  const box = page.getByRole("complementary", { name: "구매 요약" });
  // 위쪽 구매 영역이 보이는 동안에는 같은 버튼이 두 번 보이지 않습니다
  await expect(box.getByRole("button", { name: "바로 구매" })).toBeHidden();
  await page.locator("#producer").scrollIntoViewIfNeeded();
  await expect(box.getByRole("button", { name: "바로 구매" })).toBeVisible();
  await box.getByRole("combobox").selectOption("5kg");
  await expect(box).toContainText("23,900원");
  await box.getByRole("button", { name: /담기/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "장바구니에 담았어요" })).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByRole("link", { name: "제주 노지 감귤 5kg" })).toBeVisible();
});
