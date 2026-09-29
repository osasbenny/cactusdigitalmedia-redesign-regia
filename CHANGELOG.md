# Changelog

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
