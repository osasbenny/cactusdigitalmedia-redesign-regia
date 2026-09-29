# Inquiry email setup

The frontend POSTs JSON to `/api/contact` or `/api/project`. Both use shared server validation, a honeypot, exact-origin checks, 16 KiB body limits, consent validation and durable Upstash Redis rate limiting (5 inquiries per hashed network identifier per hour). The SMTP server must accept a recipient before the API returns success. Messages are sent as plain text; user email is only Reply-To, never From. No automatic replies, mailing-list subscriptions or fabricated successes.

Set these in Vercel **Preview** first, then Production after acceptance:

| Variable | Value |
|---|---|
| SMTP_HOST | Your SMTP provider hostname |
| SMTP_PORT | 465 for implicit TLS or 587 for required STARTTLS |
| SMTP_USER | Provider login |
| SMTP_PASSWORD | Provider password, stored only in Vercel |
| SMTP_FROM | Provider-authorized sender, e.g. Cactus Digital Media <info@cactusdigitalmedia.ng> |
| CONTACT_TO | Owner-approved recipient inbox |
| ALLOWED_ORIGINS | Comma-separated exact HTTPS origins, including the specific preview URL; production cactusdigitalmedia.ng and www.cactusdigitalmedia.ng |
| UPSTASH_REDIS_REST_URL | Upstash HTTPS REST endpoint, for manually configured stores |
| UPSTASH_REDIS_REST_TOKEN | Upstash token, for manually configured stores |
| RATE_LIMIT_SALT | Random secret, at least 32 bytes |

The Vercel Marketplace Upstash connection for `cactus-inquiry-rate-limit` supplies `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` automatically to Production and Preview. The API prefers these connected credentials over manual variables. Never put either credential or the salt in Git.

Never prefix secrets with VITE_. Missing SMTP or rate-limit setup returns 503 and a visible direct-contact fallback. Failed SMTP returns 502. Rate limit returns 429 with Retry-After. No message text or email address is logged. Redis stores only an HMAC-derived identifier and count for at most one hour.

Owner must complete: configure sender/domain authentication and SPF/DKIM/DMARC as required by their email provider; submit one contact and one project inquiry to a controlled inbox; confirm reception and Reply-To. These tests have NOT been performed with a real provider. Do not claim operational email delivery until they pass.

## Production mailbox supplied by owner
Use SMTP_HOST=mail.cactusdigitalmedia.ng, SMTP_PORT=465, SMTP_USER=hello@cactusdigitalmedia.ng, SMTP_FROM="Cactus Digital Media <hello@cactusdigitalmedia.ng>", and CONTACT_TO=hello@cactusdigitalmedia.ng. Store the supplied mailbox password only in Vercel's encrypted SMTP_PASSWORD variable. IMAP and POP settings are not needed by the website.

The standard .ng, www .ng and cactusdigitalmedia.vercel.app origins are trusted, along with exact VERCEL_URL, VERCEL_BRANCH_URL and VERCEL_PROJECT_PRODUCTION_URL values. ALLOWED_ORIGINS adds explicit extra origins; never use a wildcard.

SMS choices default to no and never follow from merely supplying a phone number. Selected choices require an international phone number. Successful inquiry emails include independent choices, exact versioned disclosures, server receipt timestamp, origin, and source form. Retain those email records before using any consent in a separately configured messaging system. The website does not send SMS or process STOP/HELP itself; those must be handled by the actual SMS provider workflow.
