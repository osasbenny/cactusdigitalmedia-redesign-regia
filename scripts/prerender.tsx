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
