# Project handoff — 2026-09-28

## Delivered
React/Vite/TypeScript/Tailwind website using current Cactus logo, purple branding, 11 verified service definitions and current public email/WhatsApp details. Cinematic homepage, About, Services, Portfolio, Blog, Contact, Start a Project, Products, Privacy, Terms and a real 404. Build generates 83 prerendered routes with per-page SEO and structured data.

## Portfolio
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
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, CONTACT_TO and ALLOWED_ORIGINS were saved in Vercel for Production and Preview, followed by a ready redeployment. The owner approved the marketplace terms and a free Upstash Redis store was connected to both environments. The application now prefers its generated REST credentials; a fresh 32-byte RATE_LIMIT_SALT was saved in Vercel. Redeploy this change and verify controlled contact/project submissions and inbox delivery. Direct SMTP connectivity from this workspace is unavailable. See DEPLOYMENT.md.

## Git identity correction
At the owner’s request, all seven initial commits were rewritten to use author and committer osasbenny with the account-linked GitHub noreply address 45604235+osasbenny@users.noreply.github.com. Local repository identity is configured to match. Website file trees were preserved during rewriting. Future commits must retain this identity.

## Owner-requested post-deployment update
Owner reports the site deployed at https://cactusdigitalmedia.vercel.app. Added WhatsApp card, navigation items, footer credits, and four supplied homepage videos. Both forms and the project modal now collect optional, separate SMS consent. Server records choices, source, timestamp, and disclosure wording in the inquiry email; no SMS sending or CAP enrollment is implemented. Exact production and Vercel deployment origins are accepted.
Owner explicitly authorized moving cactusdigitalmedia.ng from the old Vercel project to this project, preserving the old project. This is completed. Never commit the supplied SMTP password. SMTP authentication could not be verified from this workspace: public DNS resolves mail.cactusdigitalmedia.ng, but direct SMTP connectivity is unavailable here. Redis rate-limiter credentials are still required; do not disable the fail-closed protection.
