# Changelog

## 2026-09-29 — HabitMind Android portfolio
- Added HabitMind under Mobile Applications and Recent work, with four optimized screenshots from its official Google Play listing and a direct store link.
- Generalized app card previews so every app displays its own gallery rather than GoFuel-specific image names.
- Both original portfolio screenshot ZIPs were inspected; neither contains TaskFlow images. TaskFlow publication awaits the correct assets.

## 2026-09-28 — Reconstruction checkpoint
- Audited legacy archive and current public Cactus identity.
- Rebuilt homepage, service pages, portfolio, articles, contact and project inquiry flow.
- Added prerendered SEO pages, Vercel routing, secure SMTP APIs, tests and deployment documentation.
- Verified initial browser journeys; fixed preview route hydration and small-screen title overflow.
- Updated SMTP dependency; production audit reports zero known vulnerabilities.
- New portfolio archive and GoFuel media integration queued per owner instruction.

## Recent portfolio integration
- Added 10 owner-supplied project screenshots and GoFuel app screenshots from the official product site.
- Built recent-project categories, full design galleries and six featured homepage case studies.
- Retained legacy projects under archive/all-work filters.

## Final verification
- Prerender 83 routes and load article content per route.
- Optimize hero media and present real GoFuel app screens on the homepage.
- Fix and verify every project image, including EchoBroad thumbnail.
- Pass 17 backend tests and 10 browser checks.
- Local mobile Lighthouse reaches 95/100/100/100.
- Complete deployment and provider-setup handoff; production domain unchanged.

## 2026-09-28 — Post-deployment updates
- Added a WhatsApp conversation card matching the owner’s reference and direct chat URL.
- Added Home and Contact us to navigation; updated footer credits and automatic copyright year.
- Added four owner-supplied, responsive videos immediately after the homepage hero, with viewport playback, pause controls, posters, and reduced-motion support.
- Fixed form origin handling for the published Vercel alias and exact deployment URLs.
- Added separate, unchecked, optional inquiry and marketing SMS preferences to contact, project page, and modal. Email delivery includes a versioned consent record. Updated privacy and terms disclosures.
- SMTP and exact-origin environment variables were configured in Vercel and the updated deployment became ready.

## 2026-09-29 — Domain migration and live verification
- Moved the apex and www domains from the previous Vercel project to `cactusdigitalmedia`; retained the previous project.
- Attached the apex to Production and configured a permanent 308 redirect from www to the apex. Both show valid configuration and the live site loads at the canonical domain.
- A controlled live form request reached the server but returned 503 because no working Redis rate limiter is connected. Upstash integration creation requires acceptance of marketplace/provider terms before Redis credentials and live SMTP delivery can be verified.
- After owner confirmation, provisioned a free Upstash Redis database, connected it to Production and Preview, and set a random 32-byte rate-limit salt in Vercel. Updated the API to prefer Vercel's generated REST credentials, preserving manual configuration support.
- Production contact and project-brief submissions using the Cactus mailbox both returned the success state after SMTP accepted the messages. The owner confirmed both arrived in the mailbox with an inbox screenshot.
- Added the owner's January 2020 founding history, founder/CEO and lead engineering role, service-to-product evolution, specialist collaboration, and long-term direction to About, with a concise homepage introduction.

- Renamed the GoFuel portfolio display title to GoFuel App at the owner’s request; the existing URL remains /portfolio/gofuel.

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
