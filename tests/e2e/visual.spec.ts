import { test, expect } from "@playwright/test";
test("desktop and mobile visual evidence", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    for (const img of await page.locator('img[loading="lazy"]').all())
      await img.scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => undefined)),
      );
      window.scrollTo(0, 0);
    });
    await expect(page.locator("h1")).toBeVisible();
    await page.screenshot({
      path: `docs/screenshots/home-${width === 1440 ? "desktop" : "mobile"}.png`,
      fullPage: true,
    });
  }
});
