import { expect, type Page } from "@playwright/test";

/** 콘솔 오류 수집 — 샌드박스·오프라인에서 실패하는 외부 웹폰트 요청은 제외합니다. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const ignore = /jsdelivr|fonts\.g|net::ERR|Failed to load resource/;
  page.on("console", (m) => m.type() === "error" && !ignore.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

/** 모바일 에뮬레이션에선 넘치는 요소가 있으면 뷰포트 자체가 넓어지므로 innerWidth도 함께 봅니다. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { inner, visual, scroll } = await page.evaluate(() => ({
    inner: window.innerWidth,
    visual: Math.round(window.visualViewport?.width ?? window.innerWidth),
    scroll: document.documentElement.scrollWidth,
  }));
  expect(inner, "layout viewport widened (page zoomed out)").toBe(visual);
  expect(scroll, "horizontal scroll").toBeLessThanOrEqual(visual);
}

/** 상품 카드의 상품명 링크 */
export const productLinks = (page: Page) => page.locator("main h3 a[href^='/products/']");

/** 모바일 구매 바의 장바구니 버튼 / PC 구매 영역의 장바구니 버튼 */
export async function addToCartOnDetail(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "장바구니에 담기" }).click();
  else await page.getByRole("button", { name: "장바구니", exact: true }).click();
}
