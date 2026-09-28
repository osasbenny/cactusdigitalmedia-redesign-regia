# Cactus Digital Media

React + Vite + TypeScript + Tailwind reconstruction of the supplied cinematic website archive, rebranded with current Cactus assets and services.

## Run
```sh
npm ci
npm run dev
```

## Verify
```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Build output: `dist`. The build prerenders 83 routes plus a 404 page with unique metadata, canonical URLs and structured data. Vercel deploys `/api/contact` and `/api/project` separately as Node functions.

## Features
- Responsive cinematic homepage, 11 service pages, About, Contact, project discovery dialog and page.
- 11 owner-approved recent case studies plus 35 archived website projects, with responsive screenshots, full galleries, category filters and search.
- 16 migrated articles; unsupported legacy services and duplicate paragraphs removed.
- Verified current logo, email and WhatsApp link; no fabricated testimonials or performance claims.
- Accessible Radix modal, reduced-motion support, explicit media playback, local assets.
- SMTP inquiries with validation, durable abuse limits and honest error handling.

## Deployment and remaining setup
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/EMAIL.md](docs/EMAIL.md). Add the SMTP and Upstash variables in Vercel. Email delivery cannot operate until these are configured. Production domain cutover requires preview acceptance and owner approval.

Read [docs/MEMORY.md](docs/MEMORY.md) for handoff and current verification status. Preserve source-backed claims; see RULES.md.

## Verified results
Lint, TypeScript, 17 backend tests, production build, and 10 browser checks pass. Local mobile Lighthouse: performance 95, accessibility 100, best practices 100, SEO 100. See docs/TEST_PLAN.md and docs/lighthouse-mobile.json.
