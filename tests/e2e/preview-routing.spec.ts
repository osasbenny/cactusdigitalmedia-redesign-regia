import { expect, test } from "@playwright/test";
test("preview serves browsers and crawlers and denies declared copiers", async ({
  request,
}) => {
  for (const agent of [
    "Mozilla/5.0 Chrome/131 Safari/537.36",
    "Googlebot/2.1",
    "OAI-SearchBot/1.4",
  ]) {
    const response = await request.get("/", {
      headers: { "User-Agent": agent },
    });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Build better.");
  }
  const denied = await request.get("/", {
    headers: { "User-Agent": "HTTrack/3" },
  });
  expect(denied.status()).toBe(403);
  expect(await denied.text()).toContain(
    "Automated website copying is restricted.",
  );
  expect(denied.headers()["vary"]).toContain("User-Agent");
});
test("preview preserves project routes, media redirects and 404 status", async ({
  request,
}) => {
  expect((await request.get("/portfolio/adfidia")).status()).toBe(200);
  const media = await request.get("/images/creative-team.webp", {
    maxRedirects: 0,
  });
  expect(media.status()).toBe(308);
  expect(media.headers()["location"]).toBe(
    "/images/cactus-digital-media-creative-team.webp",
  );
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/missing-page")).status()).toBe(404);
});
