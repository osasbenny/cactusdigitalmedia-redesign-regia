import { expect, test } from "@playwright/test";

const storefronts = [
  {
    route: "/beyond-the-machine-book",
    title: /Beyond The Machine/i,
    callback: "/payment/callback",
  },
  {
    route: "/thoughts-are-things-book",
    title: /Thoughts Are Things/i,
    callback: "/payment/success",
  },
  {
    route: "/my-big-adventure-coloring-book",
    title: /My Big Adventure/i,
    callback: "/purchase/success",
  },
];

for (const storefront of storefronts) {
  test(`${storefront.route} renders the storefront and its assets`, async ({
    page,
  }) => {
    const brokenAssets: string[] = [];
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (
        response.url().includes(`${storefront.route}/assets/`) &&
        response.status() >= 400
      ) {
        brokenAssets.push(response.url());
      }
    });
    for (const suffix of ["", "/"]) {
      await page.goto(`${storefront.route}${suffix}`);
      await expect(page).toHaveTitle(storefront.title);
      await expect(page.locator("#root")).toContainText(storefront.title);
      await expect(page.locator("#root")).not.toBeEmpty();
      await expect(page.locator("#geist-skip-nav")).toHaveCount(0);
      await expect(page.locator("img").first()).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator("img")
            .evaluateAll((images) =>
              images
                .filter((image) => image.getBoundingClientRect().width > 0)
                .every(
                  (image) =>
                    (image as HTMLImageElement).complete &&
                    (image as HTMLImageElement).naturalWidth > 0,
                ),
            ),
        )
        .toBe(true);
    }
    await page.goto(`${storefront.route}${storefront.callback}`);
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.locator("body")).not.toContainText("Page not found");
    await expect(page.locator('a[href="/"]')).toHaveCount(0);
    await expect(
      page.locator(`a[href="${storefront.route}"]`).first(),
    ).toBeVisible();
    expect(errors).toEqual([]);
    expect(brokenAssets).toEqual([]);
  });
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 667, height: 375 },
  { width: 1280, height: 800 },
]) {
  test(`Beyond checkout stays within ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/beyond-the-machine-book");
    for (const edition of ["Paperback", "eBook", "Audiobook"]) {
      await page
        .locator(".format-card")
        .filter({
          has: page.getByRole("heading", { name: edition, exact: true }),
        })
        .getByRole("button", { name: "Choose" })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect
        .poll(async () => {
          const bounds = await dialog.boundingBox();
          return (
            !!bounds &&
            bounds.x >= 0 &&
            bounds.y >= 0 &&
            bounds.x + bounds.width <= viewport.width + 1 &&
            bounds.y + bounds.height <= viewport.height + 1
          );
        })
        .toBe(true);
      await dialog.getByLabel("Full name").fill("Mobile Layout Check");
      await dialog.getByLabel("Email address").fill("layout@example.com");
      // Scrolling must expose the submit button even with paperback fields
      // and a short landscape viewport. Do not submit a live purchase.
      await dialog
        .getByRole("button", { name: "Continue to Stripe" })
        .scrollIntoViewIfNeeded();
      await expect(
        dialog.getByRole("button", { name: "Continue to Stripe" }),
      ).toBeInViewport();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  });
}
