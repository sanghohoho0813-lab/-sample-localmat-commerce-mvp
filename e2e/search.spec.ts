import { expect, test } from "@playwright/test";

test("검색창 자동완성 — 입력하면 상품·농가가 뜨고, 방향키와 Enter로 바로 이동한다", async ({ page }) => {
  await page.goto("/");
  const box = page.getByRole("combobox", { name: "검색어" });
  await box.click();
  await box.fill("감귤");
  const list = page.getByRole("listbox", { name: "추천 검색" });
  await expect(list.getByRole("option").first()).toBeVisible();
  await expect(list.getByRole("option", { name: /제주 서귀포 감귤원/ })).toBeVisible();
  await expect(box).toHaveAttribute("aria-expanded", "true");

  await box.press("ArrowDown");
  await expect(list.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/products\/jeju-gamgyul$/);
});

test("Enter만 누르면 전체 검색 결과로 가고, 검색어는 최근 검색어에 남아 지울 수 있다", async ({ page }) => {
  await page.goto("/");
  const box = page.getByRole("combobox", { name: "검색어" });
  await box.fill("고구마");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("고구마");

  await page.goto("/search");
  const recent = page.getByRole("region", { name: "최근 검색어" });
  await expect(recent.getByRole("link", { name: "고구마" })).toBeVisible();
  await recent.getByRole("button", { name: "최근 검색어 고구마 지우기" }).click();
  await expect(page.getByRole("region", { name: "최근 검색어" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "딸기", exact: true })).toBeVisible();
});

test("적용한 필터가 칩으로 보이고 하나씩 풀 수 있다", async ({ page }) => {
  await page.goto("/products?price=u10&region=전남");
  const chips = page.getByRole("list", { name: "적용한 필터" });
  await expect(chips.getByRole("button", { name: "1만원 이하 필터 해제" })).toBeVisible();
  const narrowed = await page.locator("main h3 a[href^='/products/']").count();

  await chips.getByRole("button", { name: "1만원 이하 필터 해제" }).click();
  await expect(page).not.toHaveURL(/price=/);
  await expect(page).toHaveURL(/region=/);
  await expect.poll(() => page.locator("main h3 a[href^='/products/']").count()).toBeGreaterThan(narrowed);

  await chips.getByRole("button", { name: "초기화" }).click();
  await expect(page.getByRole("list", { name: "적용한 필터" })).toHaveCount(0);
  await expect(page).not.toHaveURL(/region=/);
});
