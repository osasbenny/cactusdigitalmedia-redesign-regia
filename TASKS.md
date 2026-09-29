# Tasks

- [x] Add HabitMind Android app with official Play Store screenshots, features and link.
- [ ] Add TaskFlow once the owner supplies its missing screenshots or the correct archive; both supplied portfolio ZIPs contain only ten website captures.

- [x] Audit archived site and current Cactus identity/services.
- [x] Build responsive React site with native routing and cinematic layout.
- [x] Integrate 11 owner-approved recent projects and GoFuel screenshots.
- [x] Add case-study galleries, 6 homepage feature cards, filters and archived work.
- [x] Migrate 16 articles and prerender 83 routes.
- [x] Build secure SMTP contact/project endpoints with durable rate limits.
- [x] Configure Vercel routing, redirects, security headers and static SEO.
- [x] Pass lint, typecheck, 17 backend tests, build and 10 browser checks.
- [x] Review mobile/desktop screenshots and Lighthouse (95/100/100/100).
- [x] Commit and push completed checkpoints to main.
- [x] Import repository into Vercel and add SMTP/origin environment variables.
- [ ] Verify real email delivery, API and routing on Vercel preview.
- [x] Owner approves production domain cutover and both domains move to the new project.

## Post-deployment update
- [x] WhatsApp chat panel; Home and Contact us navigation; automatic year and team credits.
- [x] Four responsive homepage videos with motion preferences and playback controls.
- [x] Separate optional SMS consent and server-side consent evidence; production origin fix.
- [x] Configure SMTP values in Vercel and redeploy.
- [x] Verify provider acceptance for controlled contact and project submissions in Vercel.
- [x] Verify both test messages arrived in the Cactus mailbox (owner-confirmed screenshot).
- [x] Provision and connect free Upstash Redis, set salt, and wire generated credentials.
- [x] Verify connected rate limiter allows controlled submissions in the redeployed site.
- [ ] Confirm 429 behavior without sending additional real messages.
- [x] Verify new deployment and reassign cactusdigitalmedia.ng, preserving old project; www redirects to apex.
- [x] Add founder history and product-company direction to About and homepage.

## 2026-09-29 — Portfolio and search updates

Added supplied Adfidia and Devdan designs plus Logistica logistics design concept (placeholder imagery; no client/results claims). Added explicit Vercel routes and sitemap entries. Homepage meta description uses the owner’s exact high-performance web/mobile/enterprise wording. Expanded organization/page/breadcrumb metadata, per-page social previews and crawl directives; preserved prerendered HTML and noindex 404. Cinematic videos now autoplay muted in view with pause/reduced-motion support. Back-to-top is in homepage document flow, separate from floating WhatsApp. Build (87 routes), lint and static SEO checks passed. Git push triggers production deployment; live verification pending.

Production verified: exact owner meta description, all five homepage videos playing muted in view and pausing outside it, working Back to top (scroll 0 and heading focus), 15 recent portfolio projects, and direct Adfidia route. Reserved mobile right-side space for WhatsApp. Unit tests: 26 passed. Desktop placement screenshot captured. Browser viewport resizing unavailable; mobile layout reviewed in CSS rather than claiming an automated mobile run.

## 2026-09-29 — Geographic context and branded media

Owner-confirmed markets: Nigeria (Lagos and Abuja), Tanzania, Egypt, Australia, USA and Canada. Added requested keyword metadata on all 87 pages, Organization areaServed, and visible About-page client-market context without inventing offices. Preserved exact homepage description. Renamed all 94 public images/videos/icons with descriptive cactus-digital-media prefixes, updated source/social/schema references and dynamic video/poster paths, and added 308 redirects from old media URLs. Mapping: docs/MEDIA_RENAMES.json. Build, lint, 26 tests and asset-reference checks pass. Google ignores meta keywords; visible relevant content and descriptive media context are the useful SEO elements.

## 2026-09-29 — Narrow copier deterrent and crawler access

Added early HTTP 403 route for explicit HTTrack/WebCopier/WebZIP/Teleport Pro/Offline Explorer/SiteSucker/CyotekWebCopy identifiers. No CAPTCHA, global bot block, or generic scripting-client restriction. Ordinary visitors, search and AI crawlers remain allowed; robots.txt advertises the existing 87-page sitemap. Production source maps explicitly off. This deters declared copiers, cannot prevent copying of publicly served assets or spoofed user agents. Build, lint and 28 tests passed. Live status verification pending deployment. See docs/CRAWLER_POLICY.md.

Live verification: browser homepage 200; Googlebot homepage 200; OAI-SearchBot sitemap 200; HTTrack homepage 403; HTTrack branded image 403. Renamed legacy image URL redirects to branded asset with 200. Location text visible on About. Improved reach-section grid grouping after visual review.
