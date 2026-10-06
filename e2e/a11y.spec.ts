import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = ["/", "/products", "/products/nonsan-ttalgi", "/cart", "/farms/nonsan-ttalgi", "/search?q=딸기", "/orders", "/mypage"];

for (const path of pages) {
  test(`접근성(axe, WCAG 2.1 AA) — ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // 공용 뒤로·앞으로 버튼은 여러 데모가 함께 쓰는 외부 스크립트라 검사에서 뺍니다.
      .exclude("[data-mirae-history-nav]")
      .analyze();
    const summary = violations.map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
    expect(summary).toEqual([]);
  });
}
