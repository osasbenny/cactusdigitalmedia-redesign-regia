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
    await expect(page.locator(`a[href="${storefront.route}"]`).first()).toBeVisible();
    expect(errors).toEqual([]);
    expect(brokenAssets).toEqual([]);
  });
}
