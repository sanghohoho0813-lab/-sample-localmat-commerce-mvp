import { expect, test } from "@playwright/test";
import { collectConsoleErrors } from "./helpers";

test("깨지거나 오래된 저장값으로도 화면이 망가지지 않는다", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "localmat-cart",
      JSON.stringify({
        state: {
          items: [
            { productId: "discontinued", quantity: 1 }, // 판매 종료 상품
            { productId: "p26", quantity: 999 }, // 재고(20) 초과
            { productId: "p05", optionLabel: "10kg", quantity: 1 }, // 없는 옵션
            { productId: "p01", quantity: -3 }, // 잘못된 수량
          ],
        },
        version: 0,
      })
    );
    localStorage.setItem("localmat-wishlist", "{not json");
  });

  await page.goto("/cart");
  const rows = page.locator("main li").filter({ has: page.getByRole("button", { name: /삭제$/ }) });
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("논산 딸기 프리미엄 세트");
  await expect(rows.first().getByRole("group", { name: "수량" })).toContainText("20개");

  await page.goto("/mypage");
  await expect(page.getByText("찜한 상품이 아직 없어요")).toBeVisible();
  expect(errors).toEqual([]);
});

test("다른 탭에서 담은 상품이 이 탭 장바구니 배지에도 반영된다", async ({ context, isMobile }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  await a.goto("/products/jeju-hallabong");
  await b.goto("/");
  if (isMobile) await a.getByRole("button", { name: "장바구니에 담기" }).click();
  else await a.getByRole("button", { name: "장바구니", exact: true }).click();
  await expect(b.locator("header").getByRole("link", { name: /장바구니, 상품 1개/ })).toBeVisible();
});
