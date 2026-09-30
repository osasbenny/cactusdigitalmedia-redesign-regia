import { timingSafeEqual } from "node:crypto";
import type { VercelRequest } from "@vercel/node";

type JsonRecord = Record<string, unknown>;

export interface SeoVisionArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  schemaJson: unknown;
  sourcePayload: JsonRecord;
}

const ARTICLE_SET_KEY = "cactus:seovision:articles";
const ARTICLE_INDEX_KEY = "cactus:seovision:articles:published";
const ARTICLE_KEY_PREFIX = "cactus:seovision:article:";
const ORIGIN = "https://cactusdigitalmedia.ng";

function redisCredentials() {
  const env = process.env;
  const url =
    env.UPSTASH_REDIS_REST_KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token =
    env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("seovision_storage_unconfigured");
  return { url: url.replace(/\/$/, ""), token };
}

async function redis(command: Array<string | number>) {
  const { url, token } = redisCredentials();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`seovision_storage_http_${response.status}`);
  const body = (await response.json()) as { result?: unknown; error?: string };
  if (body.error) throw new Error("seovision_storage_error");
  return body.result;
}

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authenticateSeoVision(req: VercelRequest) {
  const expected = process.env.SEOVISION_ACCESS_TOKEN;
  if (!expected) throw new Error("seovision_token_unconfigured");
  const auth = String(req.headers.authorization || "");
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return !!match && constantTimeEqual(match[1].trim(), expected.trim());
}

export async function verifySeoVisionStorage() {
  const result = await redis(["PING"]);
  if (String(result).toUpperCase() !== "PONG")
    throw new Error("seovision_storage_unavailable");
}

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function firstString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function nestedString(record: JsonRecord, key: string, nestedKeys: string[]) {
  const nested = record[key];
  if (!isRecord(nested)) return "";
  return firstString(nested, nestedKeys);
}

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function stripUnsafeHtml(html: string) {
  return html
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|textarea|select|button)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      "",
    )
    .replace(
      /<\s*(script|style|iframe|object|embed|form|input|textarea|select|button)\b[^>]*\/?\s*>/gi,
      "",
    )
    .replace(/\s+on[a-z]+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function htmlFromBlocks(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      if (!isRecord(block)) return "";
      const type = firstString(block, ["type", "tag"]);
      const text = firstString(block, ["text", "content"]);
      if (!text) return "";
      const escaped = escapeHtml(text);
      if (["h2", "h3", "h4", "blockquote"].includes(type))
        return `<${type}>${escaped}</${type}>`;
      return `<p>${escaped}</p>`;
    })
    .join("\n");
}

function validDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : date.toISOString();
}

export function normalizeSeoVisionArticle(payload: unknown): SeoVisionArticle {
  if (!isRecord(payload)) throw new Error("invalid_article_payload");

  const title = firstString(payload, ["title", "headline", "name"]);
  if (!title) throw new Error("article_title_required");

  const requestedSlug = firstString(payload, ["slug", "url_slug", "handle"]);
  const slug = slugify(requestedSlug || title);
  if (!slug) throw new Error("article_slug_required");

  const rawHtml =
    firstString(payload, [
      "html",
      "content_html",
      "contentHtml",
      "body_html",
      "bodyHtml",
      "content",
      "body",
    ]) || htmlFromBlocks(payload.blocks);
  if (!rawHtml) throw new Error("article_content_required");

  const excerpt = firstString(payload, [
    "excerpt",
    "summary",
    "description",
    "meta_description",
    "metaDescription",
  ]);
  const metaTitle =
    firstString(payload, ["meta_title", "metaTitle", "seo_title", "seoTitle"]) ||
    title;
  const metaDescription =
    firstString(payload, [
      "meta_description",
      "metaDescription",
      "seo_description",
      "seoDescription",
    ]) || excerpt;
  const featuredImage =
    firstString(payload, [
      "featured_image",
      "featuredImage",
      "image_url",
      "imageUrl",
      "image",
    ]) || nestedString(payload, "featured_image", ["url", "src"]);
  const authorName =
    firstString(payload, ["author_name", "authorName"]) ||
    nestedString(payload, "author", ["name", "display_name", "displayName"]) ||
    (typeof payload.author === "string" ? payload.author.trim() : "") ||
    "Osagie Bernard Ebhuomhan";

  const now = new Date().toISOString();
  const publishedAt =
    validDate(
      firstString(payload, [
        "published_at",
        "publishedAt",
        "publish_date",
        "publishDate",
        "date",
      ]),
    ) || now;
  const updatedAt =
    validDate(firstString(payload, ["updated_at", "updatedAt", "modified_at"])) ||
    now;

  const id =
    firstString(payload, ["id", "article_id", "articleId", "external_id"]) || slug;
  const schemaJson =
    payload.schema_json_ld ??
    payload.schemaJsonLd ??
    payload.schema_json ??
    payload.schemaJson ??
    payload.structured_data ??
    payload.structuredData ??
    null;

  return {
    id,
    slug,
    title,
    excerpt,
    html: stripUnsafeHtml(rawHtml),
    metaTitle,
    metaDescription,
    featuredImage,
    authorName,
    publishedAt,
    updatedAt,
    schemaJson,
    sourcePayload: payload,
  };
}

export async function saveSeoVisionArticle(article: SeoVisionArticle) {
  const key = ARTICLE_KEY_PREFIX + article.slug;
  const score = Math.floor(new Date(article.publishedAt).valueOf() / 1000);
  await redis(["SET", key, JSON.stringify(article)]);
  await redis(["SADD", ARTICLE_SET_KEY, article.slug]);
  await redis(["ZADD", ARTICLE_INDEX_KEY, score, article.slug]);
}

export async function getSeoVisionArticle(slug: string) {
  const normalized = slugify(slug);
  if (!normalized) return null;
  const raw = await redis(["GET", ARTICLE_KEY_PREFIX + normalized]);
  if (typeof raw !== "string" || !raw) return null;
  try {
    return JSON.parse(raw) as SeoVisionArticle;
  } catch {
    return null;
  }
}

export async function getSeoVisionArticleSlugs() {
  const raw = await redis(["ZRANGE", ARTICLE_INDEX_KEY, 0, -1]);
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is string => typeof value === "string").reverse();
}

export function publicArticleUrl(slug: string) {
  return `${ORIGIN}/api/seovision/article?slug=${encodeURIComponent(slug)}`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeJsonLd(value: unknown) {
  if (!value) return "";
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed).replaceAll("<", "\\u003c");
  } catch {
    return "";
  }
}

export function renderSeoVisionArticle(article: SeoVisionArticle) {
  const title = escapeHtml(article.metaTitle || article.title);
  const headline = escapeHtml(article.title);
  const description = escapeHtml(article.metaDescription || article.excerpt || "");
  const author = escapeHtml(article.authorName);
  const canonical = publicArticleUrl(article.slug);
  const image = article.featuredImage ? escapeHtml(article.featuredImage) : "";
  const suppliedSchema = safeJsonLd(article.schemaJson);
  const fallbackSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.authorName },
    publisher: {
      "@type": "Organization",
      name: "Cactus Digital Media",
      url: ORIGIN,
    },
    mainEntityOfPage: canonical,
    image: article.featuredImage || undefined,
  }).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ""}
  <script type="application/ld+json">${suppliedSchema || fallbackSchema}</script>
  <style>
    :root{color-scheme:light;--ink:#11110f;--muted:#66645f;--paper:#f7f5ef;--accent:#e7652b;--line:#dedbd2}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.72}
    a{color:inherit}.top{background:#11110f;color:white}.nav{max-width:1120px;margin:auto;padding:24px;display:flex;justify-content:space-between;gap:24px;align-items:center}.brand{text-decoration:none;font-weight:800;letter-spacing:-.02em}.nav a:last-child{color:#ff7a45;text-decoration:none;font-weight:700}
    .hero{max-width:900px;margin:auto;padding:84px 24px 64px}.eyebrow{color:#ff7a45;text-transform:uppercase;font-size:13px;font-weight:800;letter-spacing:.13em}.hero h1{font-size:clamp(2.6rem,7vw,5.4rem);line-height:.98;letter-spacing:-.055em;margin:18px 0 28px}.hero p{max-width:720px;color:#d1cec7;font-size:1.2rem}.meta{color:#aaa69f;font-size:.95rem}
    .article{max-width:790px;margin:auto;padding:72px 24px 110px}.article h2,.article h3,.article h4{line-height:1.15;letter-spacing:-.035em;margin:2.2em 0 .7em}.article h2{font-size:2rem}.article h3{font-size:1.55rem}.article p,.article li{font-size:1.08rem}.article a{color:#b74618}.article img{max-width:100%;height:auto;border-radius:16px}.article blockquote{margin:2em 0;padding:8px 0 8px 24px;border-left:3px solid var(--accent);font-size:1.2rem;color:#47453f}.article pre{overflow:auto;padding:20px;background:#191917;color:#f7f5ef;border-radius:12px}.article table{width:100%;border-collapse:collapse;display:block;overflow:auto}.article td,.article th{padding:10px;border:1px solid var(--line)}
    .cta{max-width:900px;margin:0 auto 96px;padding:40px 24px;border-top:1px solid var(--line)}.cta h2{font-size:2rem;letter-spacing:-.04em}.button{display:inline-block;background:#11110f;color:white!important;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:700}.footer{border-top:1px solid var(--line);padding:32px 24px;color:var(--muted);text-align:center;font-size:.9rem}
  </style>
</head>
<body>
  <header class="top">
    <nav class="nav"><a class="brand" href="${ORIGIN}">Cactus Digital Media</a><a href="${ORIGIN}/start-project">Start a project →</a></nav>
    <div class="hero">
      <div class="eyebrow">Ideas &amp; insights</div>
      <h1>${headline}</h1>
      ${description ? `<p>${description}</p>` : ""}
      <div class="meta">${author} · <time datetime="${escapeHtml(article.publishedAt)}">${escapeHtml(new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</time></div>
    </div>
  </header>
  <main>
    <article class="article">${article.html}</article>
    <section class="cta"><h2>Need help building the system behind the idea?</h2><p>Talk to Cactus Digital Media about custom software, SaaS, AI automation, web applications and mobile products.</p><a class="button" href="${ORIGIN}/start-project">Discuss your project</a></section>
  </main>
  <footer class="footer">© ${new Date().getUTCFullYear()} Cactus Digital Media · Lagos, Nigeria · Working across borders.</footer>
</body>
</html>`;
}
