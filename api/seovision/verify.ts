import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  authenticateSeoVision,
  verifySeoVisionStorage,
} from "../../server/seovision.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    if (!authenticateSeoVision(req))
      return res.status(401).json({ error: "Unauthorized." });
    await verifySeoVisionStorage();
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("SeoVision verification failed:", error instanceof Error ? error.message : "unknown");
    return res.status(503).json({ error: "SeoVision integration is not configured." });
  }
}
