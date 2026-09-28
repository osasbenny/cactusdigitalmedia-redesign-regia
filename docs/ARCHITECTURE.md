# Architecture

src/components contains shared layout, forms, media and portfolio cards. src/pages contains page composition. src/data JSON contains audited project, service and article content. React Router handles client transitions. scripts/prerender.tsx renders static HTML for each known route. Vercel serves static HTML and two Node serverless endpoints. server/inquiry.ts owns validation, origin checks, Redis limits and SMTP. No WordPress runtime or database is required.
