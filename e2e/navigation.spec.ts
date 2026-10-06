import { expect, test } from "@playwright/test";
import { collectConsoleErrors, productLinks } from "./helpers";

test("정렬·필터는 상품을 보고 돌아와도 유지된다", async ({ page, isMobile }) => {
  await page.goto("/products");
  await page.selectOption('select[aria-label="정렬"]', "price_asc");
  if (isMobile) {
    await page.getByRole("button", { name: /^필터/ }).click();
    const sheet = page.getByRole("dialog", { name: "필터" });
    await sheet.getByRole("button", { name: "전남" }).click();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  } else {
    await page.locator("aside").filter({ hasText: "가격" }).getByRole("button", { name: "전남" }).click();
  }
  await expect(page).toHaveURL(/sort=price_asc/);
  await expect(page).toHaveURL(/region=/);

  const first = await productLinks(page).first().textContent();
  const count = await productLinks(page).count();
  await productLinks(page).first().click();
  await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/);

  await page.goBack();
  await expect(page.locator('select[aria-label="정렬"]')).toHaveValue("price_asc");
  await expect(productLinks(page).first()).toHaveText(first ?? "");
  await expect(productLinks(page)).toHaveCount(count);
});

test("모바일 구매 화면에는 헤더 뒤로 가기가 있다", async ({ page, isMobile }) => {
  test.skip(!isMobile, "모바일 전용");
  await page.goto("/products?category=fruit");
  await productLinks(page).first().click();
  const back = page.locator("header").getByRole("button", { name: "뒤로 가기" });
  await expect(back).toBeVisible();
  await expect(page.getByRole("navigation", { name: "모바일 내비게이션" })).toHaveCount(0);
  await back.click();
  await expect(page).toHaveURL(/category=fruit/);
});

test("검색 — 띄어 쓴 여러 단어, 결과 없음 안내", async ({ page }) => {
  await page.goto(`/search?q=${encodeURIComponent("제주 감귤")}`);
  await expect(productLinks(page).first()).toBeVisible();
  await page.goto("/search?q=zzzz");
  await expect(page.getByText("검색 결과가 없어요")).toBeVisible();
  await page.getByRole("link", { name: "딸기", exact: true }).click();
  await expect(page).toHaveURL(/q=%EB%94%B8%EA%B8%B0/);
});

test("농가 페이지에서 판매 상품으로 바로 이동", async ({ page }) => {
  await page.goto("/farms/nonsan-ttalgi");
  await page.getByRole("link", { name: /판매 상품 \d+개 보기/ }).click();
  await expect(page).toHaveURL(/#farm-products$/);
  await expect(page.locator("#farm-products")).toBeInViewport();
});

test("없는 주소는 404 안내 화면", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const response = await page.goto("/products/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
  await page.goto("/order-complete/nope");
  await expect(page.getByText("주문 정보를 찾을 수 없어요")).toBeVisible();
  expect(errors).toEqual([]);
});
