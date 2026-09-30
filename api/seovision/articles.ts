import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  authenticateSeoVision,
  normalizeSeoVisionArticle,
  publicArticleUrl,
  saveSeoVisionArticle,
} from "../../server/seovision.js";

const MAX_BODY_BYTES = 2_000_000;
const META_DESCRIPTION_LIMIT = 155;

function hasExplicitMetaDescription(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const record = body as Record<string, unknown>;
  return [
    "meta_description",
    "metaDescription",
    "seo_description",
    "seoDescription",
  ].some((key) => typeof record[key] === "string" && record[key]!.trim().length > 0);
}

function uniqueFallbackMetaDescription(title: string, excerpt: string) {
  const candidate = excerpt
    ? `${title}: ${excerpt}`
    : `${title}. Practical guidance from Cactus Digital Media for businesses planning their next digital product or technology decision.`;

  if (candidate.length <= META_DESCRIPTION_LIMIT) return candidate;

  const clipped = candidate.slice(0, META_DESCRIPTION_LIMIT - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const cut = lastSpace >= 110 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.replace(/[,:;\s]+$/g, "")}…`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    if (!authenticateSeoVision(req))
      return res.status(401).json({ error: "Unauthorized." });
  } catch {
    return res.status(503).json({ error: "SeoVision integration is not configured." });
  }

  if (!String(req.headers["content-type"] || "").startsWith("application/json"))
    return res.status(415).json({ error: "Expected application/json." });

  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES)
    return res.status(413).json({ error: "Article payload is too large." });

  let body: unknown = req.body;
  try {
    if (typeof body === "string") body = JSON.parse(body);
    if (Buffer.byteLength(JSON.stringify(body) || "") > MAX_BODY_BYTES)
      return res.status(413).json({ error: "Article payload is too large." });
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload." });
  }

  try {
    const article = normalizeSeoVisionArticle(body);

    // Keep author-supplied SEO descriptions intact. If SeoVision omits one,
    // build a title-aware fallback so articles that share a generic excerpt
    // do not inherit identical meta descriptions.
    if (!hasExplicitMetaDescription(body)) {
      article.metaDescription = uniqueFallbackMetaDescription(
        article.title,
        article.excerpt,
      );
    }

    await saveSeoVisionArticle(article);
    const url = publicArticleUrl(article.slug);

    // Return the public URL in both common shapes. SeoVision can consume the
    // documented URL while the additional fields are harmless for debugging.
    return res.status(200).json({
      ok: true,
      url,
      publicUrl: url,
      slug: article.slug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("SeoVision article ingest failed:", message);
    if (
      [
        "invalid_article_payload",
        "article_title_required",
        "article_slug_required",
        "article_content_required",
      ].includes(message)
    )
      return res.status(400).json({ error: "Invalid article payload." });
    return res.status(503).json({ error: "Article could not be stored." });
  }
}
