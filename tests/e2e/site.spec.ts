import { test, expect } from "@playwright/test";
import { allRoutes } from "../../src/lib/metadata";
test("all pages render, image assets load, and route metadata matches", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of allRoutes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await page.locator("img").evaluateAll(async (nodes) => {
      const images = nodes.filter(
        (el): el is HTMLImageElement => el instanceof HTMLImageElement,
      );
      images.forEach((img) => (img.loading = "eager"));
      await Promise.all(images.map((img) => img.decode()));
    });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://cactusdigitalmedia.ng${route}`,
    );
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter(
              (img) =>
                img instanceof HTMLImageElement &&
                img.complete &&
                !img.naturalWidth,
            )
            .map((img) => (img as HTMLImageElement).src),
        ),
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("responsive home and inquiry pages do not overflow", async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/portfolio", "/contact", "/start-project"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}`,
      ).toBe(true);
    }
  }
});
test("mobile navigation opens, navigates, and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Portfolio", exact: true })
    .click();
  await expect(page).toHaveURL("/portfolio");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
});
test("portfolio filters and search work", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.locator(".project-card")).toHaveCount(16);
  await page
    .getByRole("button", { name: "Mobile Applications", exact: true })
    .click();
  await expect(page.locator(".project-card")).toHaveCount(3);
  await page
    .getByRole("link", { name: "View TaskFlow App", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("TaskFlow App");
  await expect(page.locator(".app-gallery img")).toHaveCount(4);
  await expect(
    page.getByRole("img", { name: "TaskFlow App icon", exact: true }),
  ).toBeVisible();
  await page.goto("/portfolio?view=Mobile+Applications");
  const habit = page.getByRole("link", { name: "View HabitMind", exact: true });
  await expect(habit.locator("img")).toHaveCount(3);
  await habit.click();
  await expect(page.locator(".app-gallery img")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "View on Google Play" }),
  ).toHaveAttribute(
    "href",
    "https://play.google.com/store/apps/details?id=com.habitmind.app",
  );
  await page.goto("/portfolio?view=Mobile+Applications");
  await page.getByRole("searchbox", { name: "Search projects" }).fill("GoFuel");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.locator(".project-picture").click();
  await expect(page.locator("h1")).toHaveText("GoFuel App");
});
test("project modal traps focus, closes with Escape, and restores focus", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Start a project" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("contact validates fields and presents server errors honestly", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel("What can we help with?").selectOption("web-design");
  await page
    .getByLabel("Your message")
    .fill("This is a test message for the website form.");
  await page.locator('input[name="consent"]').check();
  await page.route("**/api/contact", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "The inquiry form is temporarily unavailable.",
      }),
    }),
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
});
test("project requires budget and timeline; success is tied to accepted response", async ({
  page,
}) => {
  await page.goto("/start-project");
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel("What can we help with?").selectOption("saas");
  await page
    .getByLabel("Tell us about your project")
    .fill("Please build a useful subscription product.");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Send project brief" }).click();
  await expect(page.locator('select[name="budget"]')).toBeFocused();
  await page.getByLabel("Budget range").selectOption("Let’s discuss");
  await page.getByLabel("Desired timeline").selectOption("Flexible");
  await page.route("**/api/project", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    }),
  );
  await page.getByRole("button", { name: "Send project brief" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your project brief has been received",
  );
});
test("unknown routes display a noindex 404 and reduced motion disables decorative animation", async ({
  page,
}) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.locator("h1")).toContainText("off");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator(".hero-ring")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("recent work galleries and article navigation load real content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(6);
  await page.locator(".project-picture").first().click();
  await expect(page.locator("h1")).toHaveText("GoFuel App");
  await expect(page.locator(".app-gallery img")).toHaveCount(5);
  await page.goto("/blog");
  await page.locator(".article-list a").first().click();
  await expect(page.locator(".article-body h2").first()).toBeVisible();
  await expect(page.locator(".article-body")).not.toContainText(
    "Loading article",
  );
});

test("WhatsApp card matches the contact flow and restores keyboard focus", async ({
  page,
}) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const trigger = page.getByRole("button", {
      name: "Chat with Cactus Digital Media on WhatsApp",
    });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start WhatsApp Chat" }),
    ).toHaveAttribute("href", "https://wa.me/message/GHSJFUNL4CLDM1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test("all form surfaces show independent optional SMS choices", async ({
  page,
}) => {
  for (const route of ["/contact", "/start-project", "/"]) {
    await page.goto(route);
    if (route === "/")
      await page.getByRole("button", { name: "Start a project" }).click();
    const inquiry = page.locator('input[name="smsInquiryConsent"]');
    const marketing = page.locator('input[name="smsMarketingConsent"]');
    await expect(inquiry).not.toBeChecked();
    await expect(marketing).not.toBeChecked();
    await expect(inquiry).not.toHaveAttribute("required", "");
    await expect(marketing).not.toHaveAttribute("required", "");
    await inquiry.check();
    await expect(marketing).not.toBeChecked();
    await expect(page.locator('input[name="phone"]')).toHaveAttribute(
      "required",
      "",
    );
    await inquiry.uncheck();
    await expect(page.locator('input[name="phone"]')).not.toHaveAttribute(
      "required",
      "",
    );
    await expect(page.locator(".sms-policy-links a")).toHaveCount(2);
  }
});

test("four responsive videos have real sources, posters, and reduced-motion controls", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".motion-grid video")).toHaveCount(4);
  for (const video of await page.locator(".motion-grid video").all()) {
    const poster = await video.getAttribute("poster");
    expect((await request.get(poster!)).ok()).toBe(true);
    expect((await request.get(poster!.replace(".webp", ".mp4"))).ok()).toBe(
      true,
    );
    expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(
      true,
    );
  }
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Home", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Contact us", exact: true }),
  ).toBeVisible();
});
