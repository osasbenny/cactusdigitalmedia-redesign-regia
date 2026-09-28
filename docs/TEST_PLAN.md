# Verification and launch acceptance

## Completed locally — 2026-09-28

| Check | Result |
|---|---|
| ESLint | Passed |
| TypeScript | Passed |
| Backend tests | 17 passed |
| Production build | Passed; 83 prerendered routes plus 404 |
| Browser checks | 10 passed |
| Production dependency audit | Zero known vulnerabilities |
| Mobile Lighthouse | Performance 95 / Accessibility 100 / Best Practices 100 / SEO 100 |

Browser tests verify all routes and metadata; decode every image; navigation; portfolio category/search; project detail navigation; Radix modal focus trap, Escape and focus restoration; form required fields, failure and acknowledged-success states; 404 noindex; reduced motion; article client navigation; GoFuel gallery; desktop/mobile screenshots. Layout widths checked: 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. Screenshots were reviewed.

Backend tests cover schema failures, phone preference validation, origin enforcement, method rejection, honeypot, missing SMTP configuration, rate-limit failure, 429 throttling, SMTP rejection and SMTP acceptance. Provider calls in automated tests are mocked; they prove application behavior, NOT live email delivery.

Local Lighthouse uses a production build with static gzip compression, equivalent to compressed asset delivery expected from hosting. It is lab evidence, not field Core Web Vitals or a guarantee of Vercel scores. Initial unoptimized/uncompressed local performance was 73; optimized result is 95. Report: lighthouse-mobile.json.

## Reproduce
```
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Local container used Node 24; package/Vercel target and GitHub CI use Node 22.x. Browser runner supports an optional PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH for restricted environments; standard CI uses Playwright-installed Chromium. No runtime browser dependency is deployed.

## Required on Vercel preview before production approval
- [ ] Confirm Vercel build completes and serverless functions are deployed.
- [ ] Configure SMTP, recipient inbox, exact preview origin and Upstash Redis variables.
- [ ] Submit a controlled contact inquiry; confirm inbox receipt and correct Reply-To.
- [ ] Submit a controlled project brief; confirm all project fields arrive.
- [ ] Verify 429 behavior and usable failure fallback.
- [ ] Verify 308 redirects, unknown-route HTTP 404, API method responses, robots and sitemap.
- [ ] Review mobile/desktop preview and run Lighthouse against its actual URL.
- [ ] Review newest portfolio screenshots and public link choices with owner.
- [ ] Confirm www-to-bare canonical redirect, retain email DNS records, and obtain explicit production cutover approval.

No production cutover or real outbound email occurred during this task.
