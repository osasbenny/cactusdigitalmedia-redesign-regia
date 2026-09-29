import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import config from "../vercel.json";

const rule = config.routes.find(
  (route) => route.dest === "/access-restricted.html",
)!;
const match = new RegExp(rule.has![0].value);

test("named bulk copiers are denied before normal routes", () => {
  expect(config.routes.indexOf(rule)).toBe(1);
  expect(rule.status).toBe(403);
  expect(rule.headers!["Cache-Control"]).toBe("private, no-store");
  for (const agent of [
    "Mozilla/4.5 (compatible; HTTrack 3.0x)",
    "WinHTTrack",
    "httrack",
    "WebCopier/6",
    "WebZIP",
    "Teleport Pro",
    "Offline Explorer",
    "SiteSucker",
    "CyotekWebCopy",
  ])
    expect(match.test(agent)).toBe(true);
});
test("search, AI discovery, ordinary browsers and integrations are not denied", () => {
  for (const agent of [
    "Googlebot/2.1",
    "Googlebot-Image",
    "Bingbot/2.0",
    "OAI-SearchBot/1.4",
    "ChatGPT-User/1.0",
    "PerplexityBot",
    "Claude-SearchBot",
    "Google-Extended",
    "Mozilla/5.0 Chrome/131 Safari/537.36",
    "Mozilla/5.0 iPhone Safari/604.1",
    "curl/8",
    "python-requests/2",
    "",
  ])
    expect(match.test(agent)).toBe(false);
  const robots = readFileSync("public/robots.txt", "utf8");
  expect(robots).toContain(
    "Sitemap: https://cactusdigitalmedia.ng/sitemap.xml",
  );
  expect(robots).toContain("User-agent: *\nAllow: /\nDisallow: /api/");
});
