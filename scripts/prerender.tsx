import postContent from "../src/data/posts.json" with { type: "json" };
import { ArticleContext } from "../src/lib/article";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "../src/App";
import { allRoutes, metadata, structuredData } from "../src/lib/metadata";
const template = readFileSync("dist/index.html", "utf8");
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const route of [...allRoutes, "/404"]) {
  const m = metadata(route);
  const article = postContent.find((p) => route === `/blog/${p.slug}`) || null;
  const markup = renderToString(
    <StaticRouter location={route}>
      <ArticleContext.Provider value={article}>
        <App />
      </ArticleContext.Provider>
    </StaticRouter>,
  );
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escape(m.title)}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*/,
      `$1${escape(m.description)}`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*/,
      `$1${escape(m.title)}`,
    )
    .replace(
      /(<meta property="og:description" content=")[^"]*/,
      `$1${escape(m.description)}`,
    )
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${m.canonical}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${m.canonical}`)
    .replace(
      '<script type="application/ld+json" id="structured-data">{}</script>',
      `<script type="application/ld+json" id="structured-data">${JSON.stringify(structuredData(route)).replaceAll("<", "\\u003c")}</script>`,
    );
  for (const [attribute, key, value] of [
    ["name", "keywords", m.keywords],
    ["property", "og:image", m.image],
    ["property", "og:type", m.type],
    ["name", "twitter:title", m.title],
    ["name", "twitter:description", m.description],
    ["name", "twitter:image", m.image],
  ])
    html = html.replace(
      new RegExp(`(<meta ${attribute}="${key}" content=")[^"]*`),
      `$1${escape(value)}`,
    );
  html = html.replace(
    "</body>",
    `<script type="application/json" id="article-data">${JSON.stringify(article).replaceAll("<", "\\u003c")}</script></body>`,
  );
  if (route === "/404")
    html = html.replace(
      'content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"',
      'content="noindex"',
    );
  const dir = route === "/" ? "dist" : `dist${route}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}
writeFileSync("dist/404.html", readFileSync("dist/404/index.html"));
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allRoutes.map((r) => `<url><loc>https://cactusdigitalmedia.ng${r}</loc></url>`).join("")}</urlset>`,
);
console.log(`Prerendered ${allRoutes.length} routes and a 404 page.`);

mkdirSync("dist/content", { recursive: true });
for (const post of postContent)
  writeFileSync(`dist/content/${post.slug}.json`, JSON.stringify(post));

const STOREFRONT_ORIGIN = "https://59to10k-storefront.vercel.app";
const STOREFRONT_ROUTE = "/59to10k-guide";
const STOREFRONT_URL = `https://cactusdigitalmedia.ng${STOREFRONT_ROUTE}`;

async function fetchStorefrontFile(path: string) {
  const response = await fetch(`${STOREFRONT_ORIGIN}/${path}`, {
    headers: { "User-Agent": "CactusDigitalMedia-Build/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new Error(`Unable to mirror 59to10k ${path}: HTTP ${response.status}`);
  return response.text();
}

async function mirror59to10kStorefront() {
  const [sourceIndex, sourceSuccess, styles, sourceScript, analytics, attribution] =
    await Promise.all([
      fetchStorefrontFile("index.html"),
      fetchStorefrontFile("success.html"),
      fetchStorefrontFile("styles.css"),
      fetchStorefrontFile("storefront.js"),
      fetchStorefrontFile("analytics.js"),
      fetchStorefrontFile("attribution.js"),
    ]);

  const targetDir = `dist${STOREFRONT_ROUTE}`;
  mkdirSync(targetDir, { recursive: true });

  const index = sourceIndex
    .replace(
      /<link rel="canonical" href="[^"]+">/,
      `<link rel="canonical" href="${STOREFRONT_URL}">`,
    )
    .replace(
      /<meta property="og:url" content="[^"]+">/,
      `<meta property="og:url" content="${STOREFRONT_URL}">`,
    )
    .replace(
      "https://59to10k-storefront.vercel.app/#offer",
      `${STOREFRONT_URL}#offer`,
    )
    .replace(
      '<link rel="stylesheet" href="styles.css">',
      `<base href="${STOREFRONT_ROUTE}/">\n  <link rel="stylesheet" href="styles.css">`,
    );

  const storefrontScript = sourceScript
    .replace(
      "fetch('/api/offer-window'",
      "fetch('/api/storefront-59to10k?action=offer-window'",
    )
    .replace(
      "fetch('/api/create-checkout-session'",
      "fetch('/api/storefront-59to10k?action=create-checkout-session'",
    )
    .replace(
      "fetch('/api/recent-purchases'",
      "fetch('/api/storefront-59to10k?action=recent-purchases'",
    );

  const inlineSuccessScript =
    sourceSuccess.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1] || "";
  if (!inlineSuccessScript)
    throw new Error("Unable to extract 59to10k delivery script.");

  const successScript = inlineSuccessScript.replace(
    "fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`",
    "fetch(`/api/storefront-59to10k?action=order&session_id=${encodeURIComponent(sessionId)}`",
  );

  const success = sourceSuccess
    .replace(
      '<link rel="stylesheet" href="styles.css">',
      `<base href="${STOREFRONT_ROUTE}/">\n  <link rel="stylesheet" href="styles.css">`,
    )
    .replace('href="/"', `href="${STOREFRONT_ROUTE}/"`)
    .replace(
      /<script type="module">[\s\S]*?<\/script>/,
      '<script type="module" src="success.js"></script>',
    );

  writeFileSync(`${targetDir}/index.html`, index);
  writeFileSync(`${targetDir}/success.html`, success);
  writeFileSync(`${targetDir}/styles.css`, styles);
  writeFileSync(`${targetDir}/storefront.js`, storefrontScript);
  writeFileSync(`${targetDir}/success.js`, successScript);
  writeFileSync(`${targetDir}/analytics.js`, analytics);
  writeFileSync(`${targetDir}/attribution.js`, attribution);

  const sitemapPath = "dist/sitemap.xml";
  const sitemap = readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes(STOREFRONT_URL)) {
    writeFileSync(
      sitemapPath,
      sitemap.replace(
        "</urlset>",
        `<url><loc>${STOREFRONT_URL}</loc></url></urlset>`,
      ),
    );
  }

  console.log(`Mirrored 59to10k storefront to ${STOREFRONT_ROUTE}.`);
}

await mirror59to10kStorefront();
