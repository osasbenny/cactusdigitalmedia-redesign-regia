# SeoVision custom-site integration

This project exposes the SeoVision custom-site base URL at:

`https://cactusdigitalmedia.ng/api/seovision`

SeoVision appends the route names itself:

- `GET /api/seovision/verify`
- `POST /api/seovision/articles`

## Runtime storage

Published SeoVision articles are stored in the project's Upstash Redis database. The implementation uses the same Vercel Marketplace-compatible environment variable names already supported by the inquiry rate limiter:

- `UPSTASH_REDIS_REST_KV_REST_API_URL` or `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_TOKEN`

The SeoVision bearer token must be stored server-side as:

- `SEOVISION_ACCESS_TOKEN`

Do not expose the token through a `VITE_*` variable.

## Public article URLs

SeoVision articles are served as server-rendered HTML at:

`https://cactusdigitalmedia.ng/articles/<slug>`

The article response includes canonical metadata, Open Graph/Twitter metadata and Article JSON-LD. A dynamic sitemap endpoint merges existing static/prerendered routes with SeoVision article URLs.

## Setup checklist

1. Deploy this code to Vercel.
2. Confirm the existing Upstash Redis integration is present in Vercel environment variables, or connect an Upstash Redis store.
3. In SeoVision, set the API endpoint base URL to `https://cactusdigitalmedia.ng/api/seovision`.
4. Click **Create integration & get token**.
5. Add that token to Vercel as `SEOVISION_ACCESS_TOKEN` for Production (and Preview if you want preview testing).
6. Redeploy so the environment variable is available to the functions.
7. Run SeoVision's connection test.
8. Publish a test article and confirm the returned URL under `/articles/<slug>` renders and appears in `/sitemap.xml`.

## Notes

The ingest endpoint intentionally preserves the original SeoVision JSON payload together with normalized article fields. This makes the integration tolerant of additional SeoVision metadata without losing information.
