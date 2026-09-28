# Vercel deployment

## Import
1. Import `osasbenny/cactusdigitalmedia-redesign-regia` into a **new** Vercel project. Root directory is repository root.
2. Framework Vite; Node 22.x; install `npm ci`; build `npm run build`; output `dist`.
3. Add Preview environment variables from EMAIL.md. Do not paste credentials into source.
4. Deploy a preview branch or run `vercel deploy` from the linked checkout. Do not attach the existing production domain yet.
5. Run the acceptance checklist in TEST_PLAN.md, including real contact/project email delivery and Lighthouse on the preview. Explicitly allow the preview URL in ALLOWED_ORIGINS.

`vercel.json` includes native Node serverless functions, security headers, permanent redirects, concrete prerendered route destinations, static asset handling, and a final 404 response. API paths fall through to the filesystem handler and never rewrite to the SPA. No PHP, database or WordPress hosting is required. Vercel marks preview deployments noindex by default; verify before sharing.

## Production cutover (requires owner approval)
Confirm domain canonical preference. Current site used www; the supplied migration brief explicitly requests the bare domain, which this implementation uses. Configure www → bare-domain redirect in Vercel only at approved cutover. Confirm existing DNS and mail records, preserve MX/SPF/DKIM records, then attach the domain to this project. Run the full smoke test after cutover. Preserve the prior Vercel project/deployment for instant rollback.

## Rollback
Restore the previous domain assignment/deployment in Vercel. No application data migration is involved; inquiries are delivered to email. Do not delete the old deployment or change DNS until rollback readiness is confirmed.

No Vercel deployment, project linking, DNS modification, or production cutover was performed in this task. The delivered repository is prepared for import/build; live email and preview verification remain required.
