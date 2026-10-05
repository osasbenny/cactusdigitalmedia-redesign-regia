# Project handoff — 2026-09-28

## Delivered
React/Vite/TypeScript/Tailwind website using current Cactus logo, purple branding, 11 verified service definitions and current public email/WhatsApp details. Cinematic homepage, About, Services, Portfolio, Blog, Contact, Start a Project, Products, Privacy, Terms and a real 404. Build generates 83 prerendered routes with per-page SEO and structured data.

## Portfolio
On 2026-09-29 the owner requested HabitMind and TaskFlow Android entries. HabitMind was added using official Google Play information and four screenshots; it appears under Recent work and Mobile Applications. The two complete original `Portfolio-Mockups-screencapture` ZIPs contain the same ten website screenshots and no TaskFlow assets. TaskFlow remains blocked on the correct images; no substitute app or fabricated screenshot was published. App cards now use the first three images in each project's gallery. The build now generates 84 routes.

Owner approved Portfolio-Mockups-screencapture(1).zip and GoFuel screenshots from https://gofuel.ng/. 11 recent projects now lead the portfolio: GoFuel, AuraReach, Eecki, EcoRoute, AuraHire, Beyond The Machine, Elijah Ogunsanya Associates, Elsmith Consulting, Lignel Healthcare, RenownCrown, EchoBroad. Six homepage feature cards use the recent work. Full screenshots and GoFuel galleries are local, optimized assets. 35 older entries remain under archive/all-work filtering. No invented metrics, tech stacks or business outcomes. See RECENT_PORTFOLIO_SOURCES.md.

## Content and architecture
16 legacy articles migrated with repeated paragraphs and old branding/service promotions removed. Summaries load with the app; full article bodies are prerendered and served individually for client navigation. All images are local. Video loads only when played. API handlers in api/ delegate to server/inquiry.ts; see EMAIL.md for credentials and behavior. Validation, consent, origin restrictions, honeypot and atomic Redis rate limiting precede SMTP. API never simulates delivery.

## Verification
Lint/typecheck/build pass. 17 API tests + 10 browser checks pass. All 83 routes and image decoding checked. Responsive widths 320–1920px pass. Desktop/mobile screenshots reviewed. Local mobile Lighthouse: 95 performance, 100 accessibility, 100 best practices, 100 SEO. Production dependency audit: zero known vulnerabilities. See TEST_PLAN.md for precise limitations and reproduction.

## Git and deployment
Repository: https://github.com/osasbenny/cactusdigitalmedia-redesign-regia.git
Branch: main. Owner explicitly requests commit and push at each completed savepoint. Source, assets, tests and docs are committed; token was used only transiently for authenticated Git operations, never saved in repository files or remote URL.

The repository is connected to Vercel project `cactusdigitalmedia` and production deployment `9XUWB2iKQ6saAE6vExPgVXzRXsCC` is ready. On 2026-09-29, `cactusdigitalmedia.ng` and `www.cactusdigitalmedia.ng` moved from the previous `cactusdigitalmedia-ng` project to the new one; the previous project was retained. The apex serves Production and www uses a 308 redirect to the apex. Vercel shows valid configuration for both. The live apex and redirect were opened in a browser.

## Remaining launch setup
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, CONTACT_TO and ALLOWED_ORIGINS were saved in Vercel for Production and Preview. The owner approved the marketplace terms and a free Upstash Redis store was connected to both environments. The application now prefers its generated REST credentials; a fresh 32-byte RATE_LIMIT_SALT was saved in Vercel. Deployment `2ejtzminMLt63NhwHjs6rfWX99wb` was ready. Controlled contact and project submissions succeeded, and the owner confirmed both reached the Cactus inbox with a screenshot. The founder history and company evolution were added to About and summarized on the homepage in commit `3baafed`. See DEPLOYMENT.md.

## Git identity correction
At the owner’s request, all seven initial commits were rewritten to use author and committer osasbenny with the account-linked GitHub noreply address 45604235+osasbenny@users.noreply.github.com. Local repository identity is configured to match. Website file trees were preserved during rewriting. Future commits must retain this identity.

## Owner-requested post-deployment update
Owner reports the site deployed at https://cactusdigitalmedia.vercel.app. Added WhatsApp card, navigation items, footer credits, and four supplied homepage videos. Both forms and the project modal now collect optional, separate SMS consent. Server records choices, source, timestamp, and disclosure wording in the inquiry email; no SMS sending or CAP enrollment is implemented. Exact production and Vercel deployment origins are accepted.
Owner explicitly authorized moving cactusdigitalmedia.ng from the old Vercel project to this project, preserving the old project. This is completed. Never commit the supplied SMTP password. SMTP authentication could not be verified from this workspace: public DNS resolves mail.cactusdigitalmedia.ng, but direct SMTP connectivity is unavailable here. Redis rate-limiter credentials are still required; do not disable the fail-closed protection.

The owner requested the display name GoFuel App on 2026-09-29; retain /portfolio/gofuel as the stable URL.

## 2026-09-29 — Portfolio and search updates

Added supplied Adfidia and Devdan designs plus Logistica logistics design concept (placeholder imagery; no client/results claims). Added explicit Vercel routes and sitemap entries. Homepage meta description uses the owner’s exact high-performance web/mobile/enterprise wording. Expanded organization/page/breadcrumb metadata, per-page social previews and crawl directives; preserved prerendered HTML and noindex 404. Cinematic videos now autoplay muted in view with pause/reduced-motion support. Back-to-top is in homepage document flow, separate from floating WhatsApp. Build (87 routes), lint and static SEO checks passed. Git push triggers production deployment; live verification pending.

Production verified: exact owner meta description, all five homepage videos playing muted in view and pausing outside it, working Back to top (scroll 0 and heading focus), 15 recent portfolio projects, and direct Adfidia route. Reserved mobile right-side space for WhatsApp. Unit tests: 26 passed. Desktop placement screenshot captured. Browser viewport resizing unavailable; mobile layout reviewed in CSS rather than claiming an automated mobile run.

## 2026-09-29 — Geographic context and branded media

Owner-confirmed markets: Nigeria (Lagos and Abuja), Tanzania, Egypt, Australia, USA and Canada. Added requested keyword metadata on all 87 pages, Organization areaServed, and visible About-page client-market context without inventing offices. Preserved exact homepage description. Renamed all 94 public images/videos/icons with descriptive cactus-digital-media prefixes, updated source/social/schema references and dynamic video/poster paths, and added 308 redirects from old media URLs. Mapping: docs/MEDIA_RENAMES.json. Build, lint, 26 tests and asset-reference checks pass. Google ignores meta keywords; visible relevant content and descriptive media context are the useful SEO elements.

## 2026-09-29 — Narrow copier deterrent and crawler access

Added early HTTP 403 route for explicit HTTrack/WebCopier/WebZIP/Teleport Pro/Offline Explorer/SiteSucker/CyotekWebCopy identifiers. No CAPTCHA, global bot block, or generic scripting-client restriction. Ordinary visitors, search and AI crawlers remain allowed; robots.txt advertises the existing 87-page sitemap. Production source maps explicitly off. This deters declared copiers, cannot prevent copying of publicly served assets or spoofed user agents. Build, lint and 28 tests passed. Live status verification pending deployment. See docs/CRAWLER_POLICY.md.

Live verification: browser homepage 200; Googlebot homepage 200; OAI-SearchBot sitemap 200; HTTrack homepage 403; HTTrack branded image 403. Renamed legacy image URL redirects to branded asset with 200. Location text visible on About. Improved reach-section grid grouping after visual review.

## 2026-09-29 — Fix GitHub verification failure

Latest Vercel deployment d0f6442 was READY/success. GitHub Verify website failed 11 browser tests because scripts/preview.mjs ignored route.has and served the copier restriction page to every user agent. Preview now honors header/query/host conditions, missing conditions and methods; preserves destination status and Vary headers. Added HTTP regression checks for ordinary browsers, Googlebot, OAI-SearchBot, HTTrack, media redirects, project routes and 404s. Two local HTTP E2E tests pass; lint and unit suite pass. Full browser suite will be verified on GitHub runner with Chromium. No production crawler policy relaxed.

## 2026-09-29 — Optional cookie choices and Analytics preparation

Added responsive bottom bar with owner-approved privacy copy, equal accept/reject buttons and Privacy Policy link; footer Cookie settings reopens it. Stores versioned preferences for 180 days, handles disabled storage and cross-tab changes, keeps WhatsApp above banner. Privacy policy explains optional Google Analytics, preference retention, withdrawal, data categories and external policy. GA4 integration prepared through public VITE_GA_MEASUREMENT_ID, empty by default. No Google script loads without valid ID plus acceptance. Advertising consent/features disabled; only page paths/titles sent, no query strings or form values. Withdrawal suppresses events, clears accessible GA cookies and reloads to unload tag. Build, lint, 28 unit tests passed. New browser tests cover persistence/reopening, absent-ID tracking and mobile chat spacing; GitHub full verification pending. Owner must supply GA4 G- measurement ID to activate tracking.

## 2026-09-29 — Connect owner-supplied GA4 stream

Connected public Measurement ID G-LFWWQPX923 behind optional-cookie acceptance. Updated Privacy Policy to describe the active integration. Uses standard gtag arguments queue, manual route page views, denied advertising consent and no form values/query strings. Browser regression tests cover rejection, acceptance, route tracking and withdrawal without sending CI traffic to Google. Build override remains available; empty override disables tracking. Previous consent-bar deployment and full GitHub checks succeeded. Google Analytics property enhanced measurement settings and Realtime require owner access; setup steps documented in docs/ANALYTICS_SETUP.md.

## 2026-09-30 — TaskFlow App and Analytics verification

Added TaskFlow App to Mobile Applications, Recent work and the homepage featured selection. Converted all six owner-supplied assets to descriptive Cactus Digital Media WebP files; included app icon, featured cover and four screenshot captions. Description and features reflect the supplied screens; no store URL, stack or unsupported results invented. Added explicit Vercel detail route; metadata and sitemap generated automatically. Owner confirmed Google Analytics verification and Realtime data on 29 September.

Validation: production build generated 88 routes; lint and all 28 unit tests passed, including direct Vercel reachability for every recent project.

Vercel deployed TaskFlow successfully and live page shows all six assets. CI passed 16 browser tests; portfolio filter test had stale totals (15 projects / 2 apps). Updated to 16 projects / 3 apps and added TaskFlow detail/icon/gallery verification within that flow.

## 2026-10-05 — Repair mirrored book storefronts

- Use the public production domains confirmed in the original Vercel projects; reject redirects and non-storefront HTML instead of publishing Vercel login pages.
- Mirror Vite dependency chunks, computed asset paths, public covers and external illustrations under each book route. Remove development runtime and unresolved analytics placeholders.
- Route book home and payment callback pages explicitly; scope font/style CSP to these storefronts. Point the three API proxies at the original public backends with trusted Cactus callback headers.
- Preserve original Stripe checkout, verification, webhooks, signed downloads and delivery email logic. No payment credentials or fulfillment data moved.
- Add rendering/image/callback regression checks and align existing cookie/form assertions with current UI copy.
- Local lint, typecheck and 28 unit tests pass; 17 existing and three new storefront browser checks pass. Rebased onto the newer careers changes and repaired the missing Blob dependency lockfile. CI, production deployment and live checkout verification pending.

Checkout verification caught nested proxy API requests falling through to HTML. Added explicit Vercel dispatch to each deployed catch-all function, preserving tRPC paths, query parameters and trusted callback headers; added three proxy routing regressions. First repair commit bbeb3db passed CI and deployed as dpl_CY5reZGyZsjHEJuMbHC4pAcUdBxG. All three live storefronts visually render correctly; checkout retest pending routing deployment.

Live verification: all three storefronts render with real covers and reach live Stripe Checkout (Beyond $7, Thoughts $5, My Big Adventure $10). Thoughts cancellation returns to its migrated callback. Thoughts and AuraKids unpaid-session callbacks correctly withhold downloads. Beyond runtime api/index.js was stale despite server/routers.ts already supporting the trusted header; source commit 4bcdaa7 aligns its callback URL selection without changing payment verification, webhooks or email delivery. Add mirrored callback home-link rewriting so return links stay within each storefront. Routing commit 0d44dbb passed CI and deployed as dpl_5ih2heBkNsNPnnNgGJgayFUUEAdn. Final callback-link deployment and visual recheck pending. No payment made; successful paid email delivery was not exercised.
