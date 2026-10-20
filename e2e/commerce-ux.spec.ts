import { expect, test, type Page } from "@playwright/test";

async function seedCart(page: Page, items: object[]) {
  await page.goto("/products/yujeongran-15");
  await page.evaluate((list) => localStorage.setItem("localmat-cart", JSON.stringify({ state: { items: list }, version: 1 })), items);
}

const cartRows = (page: Page) => page.locator("main li").filter({ has: page.getByRole("button", { name: /삭제$/ }) });

test("장바구니에서 고른 상품만 주문하고, 고르지 않은 상품은 장바구니에 남는다", async ({ page }) => {
  await seedCart(page, [
    { productId: "p06", optionLabel: "3kg", quantity: 1 },
    { productId: "p02", quantity: 1 },
  ]);
  await page.goto("/cart");
  await expect(page.getByText("전체 선택 2/2")).toBeVisible();
  await page.getByRole("checkbox", { name: /평창 고랭지 감자.*고르기/ }).uncheck();
  await expect(page.getByText("전체 선택 1/2")).toBeVisible();
  await expect(page.getByText("선택한 상품 1개")).toBeVisible();

  await page.getByRole("link", { name: /주문하기/ }).last().click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("제주 노지 감귤 3kg")).toBeVisible();
  await expect(page.getByText("평창 고랭지 감자")).toHaveCount(0);

  await page.getByRole("button", { name: /결제하기/ }).last().click();
  await expect(page).toHaveURL(/\/order-complete\//);
  await expect(page.getByRole("region", { name: "배송 요약" })).toBeVisible();

  await page.goto("/cart");
  await expect(cartRows(page)).toHaveCount(1);
  await expect(cartRows(page).first()).toContainText("평창 고랭지 감자");
});

test("전체 해제하면 주문할 수 없고, 선택 삭제는 되돌릴 수 있다", async ({ page }) => {
  await seedCart(page, [
    { productId: "p06", optionLabel: "3kg", quantity: 1 },
    { productId: "p02", quantity: 1 },
  ]);
  await page.goto("/cart");
  const selectAll = page.getByRole("checkbox", { name: /전체 선택/ });
  await selectAll.uncheck();
  // PC는 요약 상자, 모바일은 아래 고정 바에 같은 안내가 보입니다.
  await expect(page.locator("text=주문할 상품을 골라 주세요 >> visible=true").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /주문하기/ })).toHaveCount(0);

  await selectAll.check();
  await page.getByRole("button", { name: "선택 삭제" }).click();
  await expect(page.getByRole("heading", { name: "장바구니가 비어 있어요" })).toBeVisible();
  await page.getByRole("button", { name: "되돌리기" }).click();
  await expect(cartRows(page)).toHaveCount(2);
  await expect(cartRows(page).first()).toContainText("제주 노지 감귤");
});

test("모바일 — 아래로 읽다가 바 위의 '변경'으로 옵션·수량을 바꿔 담는다", async ({ page, isMobile }) => {
  test.skip(!isMobile, "모바일 전용");
  await seedCart(page, []);
  await page.goto("/products/jeju-gamgyul");
  await page.locator("#producer").scrollIntoViewIfNeeded();
  const summary = page.getByRole("button", { name: /선택 3kg · 1개/ });
  await expect(summary).toBeVisible();
  await summary.click();
  const sheet = page.getByRole("dialog", { name: "옵션·수량 선택" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: /^5kg/ }).click();
  await sheet.getByRole("button", { name: "수량 늘리기" }).click();
  await expect(sheet).toContainText("47,800원");
  await sheet.getByRole("button", { name: /담기/ }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("status").filter({ hasText: "장바구니에 담았어요" })).toContainText("5kg · 2개");
  await expect(page.getByRole("button", { name: /선택 5kg · 2개/ })).toBeVisible();
});

test("상품 사진을 눌러 크게 보고 Esc로 닫는다", async ({ page }) => {
  await page.goto("/products/jeju-gamgyul");
  await page.getByRole("button", { name: "사진 크게 보기" }).click();
  const viewer = page.getByRole("dialog", { name: "제주 노지 감귤 사진" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole("img", { name: "제주 노지 감귤" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("주문 내역을 상태별로 모아 본다", async ({ page }) => {
  await page.goto("/orders");
  await page.getByRole("button", { name: /진행 중/ }).click();
  await expect(page.getByRole("button", { name: /진행 중/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "리뷰쓰기" })).toHaveCount(0);
  await expect(page.getByText("도착 예정").first()).toBeVisible();
  await page.getByRole("button", { name: /배송 완료/ }).click();
  await expect(page.getByRole("button", { name: "리뷰쓰기" }).first()).toBeVisible();
});

test("홈에서 지난번에 산 상품을 바로 다시 담는다", async ({ page }) => {
  await page.goto("/");
  const row = page.getByRole("region", { name: "지난번에 산 상품" });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /장바구니 담기/ }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "장바구니에 담았어요" })).toBeVisible();
});
