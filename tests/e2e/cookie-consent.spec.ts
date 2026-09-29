import { expect, test } from "@playwright/test";

test("cookie choices persist, can be changed, and do not load unconfigured analytics", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "We value your privacy" }),
  ).toBeVisible();
  await expect(page.locator("#cactus-google-analytics")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reject optional cookies", exact: true })
    .click();
  await expect(page.locator(".cookie-banner")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".cookie-banner")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("cactus-cookie-consent")!).choice,
    ),
  ).toBe("rejected");
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await expect(page.locator(".cookie-banner")).toBeVisible();
  await page
    .getByRole("button", { name: "Accept optional cookies", exact: true })
    .click();
  await expect(page.locator(".cookie-banner")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cookie settings", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("cactus-cookie-consent")!).choice,
    ),
  ).toBe("accepted");
  await expect(page.locator("#cactus-google-analytics")).toHaveCount(0);
});
test("cookie banner fits mobile and remains clear of WhatsApp", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await expect(page.locator(".cookie-banner")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const banner = document
          .querySelector(".cookie-banner")!
          .getBoundingClientRect();
        const chat = document
          .querySelector(".whatsapp")!
          .getBoundingClientRect();
        return (
          chat.bottom < banner.top &&
          document.documentElement.scrollWidth <= innerWidth
        );
      }),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Reject optional cookies" }).click();
  await expect(page.locator(".cookie-banner")).toHaveCount(0);
});
