# Vercel deployment

## Import
1. Import `osasbenny/cactusdigitalmedia-redesign-regia` into a **new** Vercel project. Root directory is repository root.
2. Framework Vite; Node 22.x; install `npm ci`; build `npm run build`; output `dist`.
3. Add Preview environment variables from EMAIL.md. Do not paste credentials into source.
4. Deploy a preview branch or run `vercel deploy` from the linked checkout. Do not attach the existing production domain yet.
5. Run the acceptance checklist in TEST_PLAN.md, including real contact/project email delivery and Lighthouse on the preview. Explicitly allow the preview URL in ALLOWED_ORIGINS.

`vercel.json` includes native Node serverless functions, security headers, permanent redirects, concrete prerendered route destinations, static asset handling, and a final 404 response. API paths fall through to the filesystem handler and never rewrite to the SPA. No PHP, database or WordPress hosting is required. Vercel marks preview deployments noindex by default; verify before sharing.

## Current production state — 2026-09-29
Project `cactusdigitalmedia` is connected to this repository at the repository root. Its ready deployment `9XUWB2iKQ6saAE6vExPgVXzRXsCC` serves `cactusdigitalmedia.vercel.app` and `cactusdigitalmedia.ng`. The apex and www domains were moved from the old `cactusdigitalmedia-ng` project; the old project remains for rollback. The apex serves Production and www redirects to it with 308. Both are valid in Vercel. No DNS or mail records were edited.

SMTP and allowed-origin variables are saved for Production and Preview, but the inquiry API remains fail-closed with HTTP 503 until an Upstash Redis integration is created and its REST URL/token plus RATE_LIMIT_SALT work in Vercel. Creation presents Vercel Marketplace and Upstash legal terms and sharing of account identifiers/usage with Upstash; obtain the owner's confirmation before accepting those terms. Then redeploy, submit controlled contact and project inquiries, and verify actual inbox delivery/Reply-To. If Redis is still unavailable, keep the fail-closed response; never remove rate limiting merely to pass the smoke test.

## Rollback
Restore the previous domain assignment/deployment in Vercel. No application data migration is involved; inquiries are delivered to email. Do not delete the old deployment or change DNS until rollback readiness is confirmed.

Real outbound email and preview-origin delivery remain unverified.
