import { test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./helpers";

const pages = [
  "/",
  "/products",
  "/products/nonsan-ttalgi-gift",
  "/cart",
  "/checkout",
  "/orders",
  "/order-complete/seed-o05",
  "/mypage",
  "/farms",
  "/farms/nonsan-ttalgi",
  "/search?q=딸기",
];
const widths = [320, 360, 390, 414, 768, 1024, 1280];

// 긴 상품명·옵션이 담긴 '최악의' 장바구니로 모든 폭에서 가로 넘침이 없는지 봅니다.
test.describe("반응형", () => {
  test.skip(({ isMobile }) => isMobile, "폭별 컨텍스트를 직접 만들므로 한 번만 실행");

  for (const width of widths) {
    test(`${width}px — 가로로 넘치지 않는다`, async ({ browser }) => {
      const mobile = width < 768;
      const context = await browser.newContext({
        viewport: { width, height: 800 },
        isMobile: mobile,
        hasTouch: mobile,
      });
      const page = await context.newPage();
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem(
          "localmat-cart",
          JSON.stringify({
            state: {
              items: [
                { productId: "p26", quantity: 20 },
                { productId: "p09", optionLabel: "구이용 (두께 1.5cm)", quantity: 2 },
                { productId: "p24", quantity: 3 },
              ],
            },
            version: 1,
          })
        )
      );
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await test.step(path, () => expectNoHorizontalOverflow(page));
      }
      await context.close();
    });
  }
});
