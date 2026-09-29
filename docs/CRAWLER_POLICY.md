# Public crawling and copying policy

The XML sitemap at https://cactusdigitalmedia.ng/sitemap.xml lists all 87 indexable canonical pages and is regenerated from the route catalog at build time. robots.txt advertises it. Google, Bing, OpenAI search/user fetches and other search/AI discovery crawlers may access public content. Private inquiry APIs are excluded from voluntary crawling; they retain their own validation and rate limits.

Vercel deployment routes return HTTP 403 for user agents identifying HTTrack, WebCopier, WebZIP, Teleport Pro, Offline Explorer, SiteSucker or CyotekWebCopy. The rule precedes assets, redirects and pages. Blocked responses use no-store and noindex. No generic bot, curl, Python or headless-browser block; no broad user-agent allowlist or challenge. It does not disable platform security or grant a verified-bot bypass. The match is a narrow identifier check, not bot identity verification.

Public browser-delivered HTML, JavaScript, CSS, images and video cannot be made impossible to copy. User agents can be spoofed; robots.txt is voluntary. Renamed assets are descriptive, not access controls. Production source maps are explicitly disabled. Never place secrets, source repositories or private customer data in public/ or client code. Existing forms keep credentials server-side.

Rollback: remove the single user-agent has rule targeting /access-restricted.html from vercel.json and deploy. Keep the sitemap and ordinary crawler permissions intact. Stronger behavioral bot protection needs traffic review and a separate Vercel WAF rollout; it is not claimed as enabled here.
