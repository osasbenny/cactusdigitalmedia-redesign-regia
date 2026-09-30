import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSeoVisionArticle,
  renderSeoVisionArticle,
} from "../../server/seovision.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  if (!slug) return res.status(400).send("Missing article slug");

  try {
    const article = await getSeoVisionArticle(slug);
    if (!article) return res.status(404).send("Article not found");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return res.status(200).send(renderSeoVisionArticle(article));
  } catch (error) {
    console.error("SeoVision article render failed:", error instanceof Error ? error.message : "unknown");
    return res.status(503).send("Article temporarily unavailable");
  }
}
