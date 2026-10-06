import { expect, test } from "@playwright/test";

test("배송 완료 주문에 리뷰를 쓰면 상품 상세에 내 리뷰로 보인다", async ({ page }) => {
  await page.goto("/orders");
  await page.getByRole("button", { name: "리뷰쓰기" }).first().click();
  const dialog = page.getByRole("dialog", { name: "리뷰 쓰기" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "리뷰 등록" }).click();
  await expect(dialog.getByText("별점을 골라 주세요.")).toBeVisible();
  await expect(dialog.getByText("10자 이상 적어 주세요.")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "리뷰쓰기" }).first().click();
  await dialog.getByRole("radio", { name: "별점 5점" }).click();
  await dialog.locator("textarea").fill("아이들이 정말 좋아했어요. 또 주문할게요!");
  await dialog.getByRole("button", { name: "리뷰 등록" }).click();
  await expect(page.getByText("작성 완료")).toHaveCount(1);

  await page.getByRole("link", { name: "확인하기" }).click();
  await expect(page).toHaveURL(/#reviews$/);
  await expect(page.getByRole("tab", { name: /리뷰/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("내 리뷰")).toBeVisible();
});
