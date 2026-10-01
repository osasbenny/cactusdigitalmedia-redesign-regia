import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAM_ORIGIN = "https://59to10k-storefront.vercel.app";

const ACTIONS: Record<
  string,
  { path: string; methods: string[] }
> = {
  "offer-window": { path: "/api/offer-window", methods: ["POST"] },
  "create-checkout-session": {
    path: "/api/create-checkout-session",
    methods: ["POST"],
  },
  "recent-purchases": { path: "/api/recent-purchases", methods: ["GET"] },
};

function actionFrom(req: VercelRequest) {
  const value = req.query.action;
  return Array.isArray(value) ? value[0] : value;
}

function serializeBody(body: unknown) {
  if (body == null) return undefined;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = actionFrom(req);
  if (!action || !ACTIONS[action]) {
    return res.status(400).json({ error: "Unsupported storefront action." });
  }

  const target = ACTIONS[action];
  const method = (req.method || "GET").toUpperCase();
  if (!target.methods.includes(method)) {
    res.setHeader("Allow", target.methods.join(", "));
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const upstream = await fetch(`${UPSTREAM_ORIGIN}${target.path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        "User-Agent": "CactusDigitalMedia-StorefrontProxy/1.0",
      },
      body: method === "POST" ? serializeBody(req.body ?? {}) : undefined,
      signal: AbortSignal.timeout(15_000),
    });

    const payload = await upstream.text();
    res.status(upstream.status);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8",
    );
    res.setHeader("Cache-Control", "no-store");
    return res.send(payload);
  } catch (error) {
    console.error("59to10k storefront proxy error", error);
    return res.status(502).json({
      error: "The storefront service is temporarily unavailable. Please try again.",
    });
  }
}
