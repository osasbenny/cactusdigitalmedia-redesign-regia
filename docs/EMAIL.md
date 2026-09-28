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
| UPSTASH_REDIS_REST_URL | Upstash HTTPS REST endpoint |
| UPSTASH_REDIS_REST_TOKEN | Upstash token |
| RATE_LIMIT_SALT | Random secret, at least 32 bytes |

Never prefix secrets with VITE_. Missing SMTP or rate-limit setup returns 503 and a visible direct-contact fallback. Failed SMTP returns 502. Rate limit returns 429 with Retry-After. No message text or email address is logged. Redis stores only an HMAC-derived identifier and count for at most one hour.

Owner must complete: configure sender/domain authentication and SPF/DKIM/DMARC as required by their email provider; submit one contact and one project inquiry to a controlled inbox; confirm reception and Reply-To. These tests have NOT been performed with a real provider. Do not claim operational email delivery until they pass.
