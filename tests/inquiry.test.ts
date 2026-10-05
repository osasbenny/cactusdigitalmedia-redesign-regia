import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
const sendMail = vi.fn();
const put = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob", () => ({ put }));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail, close: vi.fn() }) },
}));
import {
  inquirySchema,
  projectSchema,
  allowedOrigin,
  createHandler,
} from "../server/inquiry";
const valid = {
  name: "Test Person",
  email: "test@example.com",
  message: "Please help us build a new website.",
  service: "web-design",
  consent: "yes",
};
function response() {
  const res = { status: vi.fn(), json: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}
function request(body: unknown = valid) {
  return {
    method: "POST",
    headers: {
      origin: "https://cactusdigitalmedia.ng",
      "content-type": "application/json",
    },
    body,
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as VercelRequest;
}
beforeEach(() =>
  put.mockResolvedValue({ url: "https://blob.example/submission" }),
);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("Inquiry boundaries", () => {
  it("accepts a valid contact inquiry", () =>
    expect(inquirySchema.safeParse(valid).success).toBe(true));
  it.each([
    { email: "invalid" },
    { message: "short" },
    { consent: "no" },
    { service: "fake" },
    { name: "Name\r\nBcc: other@example.com" },
  ])("rejects invalid input %j", (change) =>
    expect(inquirySchema.safeParse({ ...valid, ...change }).success).toBe(
      false,
    ),
  );
  it("requires budget and timeline for project inquiries", () =>
    expect(projectSchema.safeParse(valid).success).toBe(false));
  it("requires a phone for WhatsApp preference", () =>
    expect(
      projectSchema.safeParse({
        ...valid,
        budget: "Discuss",
        timeline: "Flexible",
        preferredContact: "WhatsApp",
      }).success,
    ).toBe(false));
  it("does not trust arbitrary origins", () => {
    expect(allowedOrigin("https://evil.example", {})).toBe(false);
    expect(allowedOrigin(undefined, {})).toBe(false);
    expect(
      allowedOrigin("https://preview.vercel.app", {
        ALLOWED_ORIGINS: "https://preview.vercel.app",
      }),
    ).toBe(true);
  });
  it("rejects GET", async () => {
    const res = response();
    await createHandler()(
      { ...request(), method: "GET" } as VercelRequest,
      res as unknown as VercelResponse,
    );
    expect(res.status).toHaveBeenCalledWith(405);
  });
  it("rejects invalid origin", async () => {
    const req = request();
    req.headers.origin = "https://evil.example";
    const res = response();
    await createHandler()(req, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(403);
  });
  it("rejects honeypot rather than simulating delivery", async () => {
    const res = response();
    await createHandler()(
      request({ ...valid, fax: "bot" }),
      res as unknown as VercelResponse,
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("accepts a safely stored submission while reporting unconfigured SMTP", async () => {
    configure();
    vi.stubEnv("SMTP_HOST", "");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }),
    );
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, notification: "unconfigured" }),
    );
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^submissions\/contacts\//),
      expect.any(String),
      expect.objectContaining({ access: "private" }),
    );
    expect(sendMail).not.toHaveBeenCalled();
  });
});
function configure() {
  for (const name of [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
    "CONTACT_TO",
    "UPSTASH_REDIS_REST_TOKEN",
    "RATE_LIMIT_SALT",
  ])
    vi.stubEnv(name, "test-value");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
}
describe("Delivery and abuse protection", () => {
  it("uses the connected Upstash REST credentials when available", async () => {
    configure();
    vi.stubEnv(
      "UPSTASH_REDIS_REST_KV_REST_API_URL",
      "https://connected.example",
    );
    vi.stubEnv("UPSTASH_REDIS_REST_KV_REST_API_TOKEN", "connected-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);
    sendMail.mockResolvedValue({ accepted: ["inbox@example.com"] });
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://connected.example",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer connected-token",
        }),
      }),
    );
  });
  it("fails closed when rate limiting is unavailable", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("blocks after five submissions", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 6 }) }),
    );
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("reports notification failure after safely storing the inquiry", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }),
    );
    sendMail.mockResolvedValue({ accepted: [] });
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, notification: "failed" }),
    );
  });
  it("does not acknowledge or email an inquiry when persistence fails", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }),
    );
    put.mockRejectedValueOnce(new Error("storage unavailable"));
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(sendMail).not.toHaveBeenCalled();
  });
  it("stores the inquiry before notifying the provider", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }),
    );
    sendMail.mockResolvedValue({ accepted: ["inbox@example.com"] });
    const res = response();
    await createHandler()(request(), res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(put.mock.invocationCallOrder[0]).toBeLessThan(
      sendMail.mock.invocationCallOrder[0],
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ notification: "sent" }),
    );
    expect(sendMail.mock.calls[0][0].replyTo).toBe(valid.email);
  });
});

describe("Deployment origins and explicit SMS consent", () => {
  it("accepts the published site and exact Vercel-owned deployment hosts", () => {
    expect(allowedOrigin("https://cactusdigitalmedia.vercel.app", {})).toBe(
      true,
    );
    expect(
      allowedOrigin("https://cactusdigitalmedia.ng", {
        ALLOWED_ORIGINS: "https://other-approved.example",
      }),
    ).toBe(true);
    expect(
      allowedOrigin("https://build-example.vercel.app", {
        VERCEL_URL: "build-example.vercel.app",
      }),
    ).toBe(true);
    expect(allowedOrigin("https://other-project.vercel.app", {})).toBe(false);
    expect(
      allowedOrigin("https://cactusdigitalmedia.ng.evil.example", {}),
    ).toBe(false);
  });
  it("defaults both SMS preferences to no without inferring consent from a phone", () => {
    const data = inquirySchema.parse({ ...valid, phone: "+2349032353823" });
    expect(data.smsInquiryConsent).toBe("no");
    expect(data.smsMarketingConsent).toBe("no");
  });
  it.each(["smsInquiryConsent", "smsMarketingConsent"])(
    "requires a valid international mobile for %s",
    async (key) => {
      const res = response();
      await createHandler()(
        request({ ...valid, [key]: "yes", phone: "123" }),
        res as unknown as VercelResponse,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(sendMail).not.toHaveBeenCalled();
    },
  );
  it("records independent preferences, disclosure, source, and server timestamp in the delivered email", async () => {
    configure();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }),
    );
    sendMail.mockResolvedValue({ accepted: ["inbox@example.com"] });
    const res = response();
    await createHandler()(
      request({
        ...valid,
        phone: "+2349032353823",
        smsInquiryConsent: "yes",
        smsMarketingConsent: "no",
        formSource: "contact-page",
      }),
      res as unknown as VercelResponse,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const record = JSON.parse(
      sendMail.mock.calls[0][0].text.split("SMS consent record\n")[1],
    );
    expect(record).toMatchObject({
      inquirySms: true,
      marketingSms: false,
      source: "contact-page",
      disclosureVersion: "2026-09-28",
      origin: "https://cactusdigitalmedia.ng",
    });
    expect(Date.parse(record.receivedAt)).not.toBeNaN();
    expect(record.disclosures).toHaveLength(2);
  });
});
