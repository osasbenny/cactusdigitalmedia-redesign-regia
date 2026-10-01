import type { VercelRequest, VercelResponse } from "@vercel/node";

const UPSTREAM_ORIGIN = "https://59to10k-storefront.vercel.app";
const CACTUS_STOREFRONT_BASE = "https://cactusdigitalmedia.ng/59to10k-guide";

const ACTIONS: Record<string, { path: string; methods: string[] }> = {
  "offer-window": { path: "/api/offer-window", methods: ["POST"] },
  "create-checkout-session": {
    path: "/api/create-checkout-session",
    methods: ["POST"],
  },
  "recent-purchases": { path: "/api/recent-purchases", methods: ["GET"] },
  order: { path: "/api/order", methods: ["GET"] },
};

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function actionFrom(req: VercelRequest) {
  return firstQueryValue(req.query.action);
}

function checkoutBody(body: unknown) {
  let parsed: Record<string, unknown> = {};
  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  } else if (body && typeof body === "object" && !Array.isArray(body)) {
    parsed = body as Record<string, unknown>;
  }

  return JSON.stringify({
    ...parsed,
    return_base: CACTUS_STOREFRONT_BASE,
  });
}

function upstreamUrl(req: VercelRequest, path: string, action: string) {
  const url = new URL(path, UPSTREAM_ORIGIN);
  if (action === "order") {
    const sessionId = firstQueryValue(req.query.session_id);
    if (sessionId) url.searchParams.set("session_id", sessionId);
  }
  return url;
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
    const body =
      method === "POST"
        ? action === "create-checkout-session"
          ? checkoutBody(req.body)
          : JSON.stringify(req.body ?? {})
        : undefined;

    const upstream = await fetch(upstreamUrl(req, target.path, action), {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        "User-Agent": "CactusDigitalMedia-StorefrontProxy/1.0",
      },
      body,
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
