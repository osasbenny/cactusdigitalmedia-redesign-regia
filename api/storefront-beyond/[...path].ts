import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAM_ORIGIN = "https://beyond-the-machine-book.vercel.app";
const CACTUS_ORIGIN = "https://cactusdigitalmedia.ng/beyond-the-machine-book";

function pathSegments(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = pathSegments(req.query.path);
  if (!segments.length) return res.status(404).json({ error: "Storefront route not found." });

  const target = new URL(`/api/${segments.join("/")}`, UPSTREAM_ORIGIN);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path" || value == null) continue;
    for (const item of Array.isArray(value) ? value : [value]) target.searchParams.append(key, item);
  }

  try {
    const method = (req.method || "GET").toUpperCase();
    const body = method === "GET" || method === "HEAD"
      ? undefined
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});
    const upstream = await fetch(target, {
      method,
      headers: {
        Accept: req.headers.accept || "application/json",
        "Content-Type": req.headers["content-type"] || "application/json",
        Origin: UPSTREAM_ORIGIN,
        Referer: `${UPSTREAM_ORIGIN}/`,
        "x-cactus-storefront-origin": CACTUS_ORIGIN,
        "User-Agent": "CactusDigitalMedia-StorefrontProxy/1.0",
      },
      body,
      signal: AbortSignal.timeout(20_000),
      redirect: "error",
    });
    const payload = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    return res.send(payload);
  } catch (error) {
    console.error("Beyond storefront proxy error", error);
    return res.status(502).json({ error: "The Beyond the Machine storefront is temporarily unavailable." });
  }
}
