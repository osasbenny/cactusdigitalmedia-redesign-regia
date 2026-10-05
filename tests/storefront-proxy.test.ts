import { afterEach, expect, test, vi } from "vitest";
import config from "../vercel.json";
import beyond from "../api/storefront-beyond/[...path]";
import thoughts from "../api/storefront-thoughts/[...path]";
import aurakids from "../api/storefront-aurakids/[...path]";
import type { VercelRequest, VercelResponse } from "@vercel/node";

afterEach(() => vi.unstubAllGlobals());

for (const [name, handler, upstream, route] of [
  [
    "beyond",
    beyond,
    "https://beyond-the-machine-book.vercel.app",
    "/beyond-the-machine-book",
  ],
  [
    "thoughts",
    thoughts,
    "https://thoughts-are-things.vercel.app",
    "/thoughts-are-things-book",
  ],
  [
    "aurakids",
    aurakids,
    "https://aura-kids-books.vercel.app",
    "/my-big-adventure-coloring-book",
  ],
] as const) {
  test(`${name} routes nested API requests to the original backend with Cactus callbacks`, async () => {
    const source = `/api/storefront-${name}/trpc/checkout.initialize`;
    const rule = config.routes.find(
      (r) => r.src === `/api/storefront-${name}/(.*)`,
    )!;
    expect(rule).toBeDefined();
    expect(source.replace(new RegExp(`^${rule.src}$`), rule.dest!)).toBe(
      `/api/storefront-${name}/[...path]?path=trpc/checkout.initialize`,
    );
    expect(config.routes.indexOf(rule)).toBeLessThan(
      config.routes.findIndex((r) => "handle" in r),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"result":{"data":{}}}', {
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = {
      status: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      send: vi.fn(),
      json: vi.fn(),
    };
    const body = {
      json: { format: "ebook", email: "verification@example.com" },
    };
    await handler(
      {
        method: "POST",
        query: { path: "trpc/checkout.initialize", batch: "1" },
        headers: { "content-type": "application/json" },
        body,
      } as unknown as VercelRequest,
      res as unknown as VercelResponse,
    );
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      `${upstream}/api/trpc/checkout.initialize?batch=1`,
    );
    expect(options.headers["x-cactus-storefront-origin"]).toBe(
      `https://cactusdigitalmedia.ng${route}`,
    );
    expect(options.headers.Origin).toBe(upstream);
    expect(options.body).toBe(JSON.stringify(body));
    expect(options.redirect).toBe("error");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  });
}
