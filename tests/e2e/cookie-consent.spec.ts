import { expect, test } from "@playwright/test";

test("analytics loads only after acceptance and stops after withdrawal", async ({
  page,
}) => {
  // Exercise consent without sending automated-test traffic to Google.
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "" }),
  );
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
  await expect(page.locator("#cactus-google-analytics")).toHaveCount(0);
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
  await expect(page.locator("#cactus-google-analytics")).toHaveAttribute(
    "src",
    "https://www.googletagmanager.com/gtag/js?id=G-LFWWQPX923",
  );
  const commands = await page.evaluate(() =>
    (window as unknown as { dataLayer: IArguments[] }).dataLayer.map((item) =>
      Array.from(item),
    ),
  );
  expect(commands).toContainEqual([
    "config",
    "G-LFWWQPX923",
    {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  ]);
  expect(commands).toContainEqual([
    "consent",
    "default",
    {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { dataLayer: IArguments[] }).dataLayer
          .filter((item) => item[0] === "event" && item[1] === "page_view")
          .map((item) => (item[2] as { page_location: string }).page_location),
      ),
    )
    .toEqual(["http://127.0.0.1:4173/", "http://127.0.0.1:4173/about"]);
  await page.evaluate(() => {
    document.cookie = "_ga=test; Path=/";
  });
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reject optional cookies", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("cactus-cookie-consent")!).choice,
      ),
    )
    .toBe("rejected");
  await expect(page.locator("#cactus-google-analytics")).toHaveCount(0);
  expect(await page.evaluate(() => document.cookie)).not.toContain("_ga=");
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
