import { createHmac, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { put } from "@vercel/blob";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { smsConsents, smsConsentVersion } from "../src/data/sms-consent.js";
import serviceData from "../src/data/services.json" with { type: "json" };

const text = (max: number) => z.string().trim().max(max).refine((v) => [...v].every((c) => c.charCodeAt(0) >= 32 || [9, 10, 13].includes(c.charCodeAt(0))));
export const inquirySchema = z.object({
  name: text(100).min(2).refine((v) => !/[\r\n]/.test(v)), email: z.email().max(254), company: text(150).optional().default(""), phone: text(40).optional().default(""),
  service: z.string().refine((v) => v === "not-sure" || serviceData.some((s) => s.slug === v)), message: text(5000).min(20), consent: z.literal("yes"),
  smsInquiryConsent: z.enum(["yes", "no"]).optional().default("no"), smsMarketingConsent: z.enum(["yes", "no"]).optional().default("no"),
  formSource: z.enum(["contact-page", "project-page", "project-modal"]).optional(), fax: text(200).optional().default(""), budget: text(80).optional(), timeline: text(80).optional(),
  website: z.union([z.literal(""), z.url().max(500).refine((v) => /^https?:\/\//.test(v))]).optional(), preferredContact: z.enum(["Email", "Phone", "WhatsApp"]).optional(),
}).strict();
export const projectSchema = inquirySchema.extend({ budget: text(80).min(1), timeline: text(80).min(1) }).refine((d) => !["Phone", "WhatsApp"].includes(d.preferredContact || "") || d.phone.length >= 7, { message: "Please provide a phone number for your preferred contact method.", path: ["phone"] });

export function allowedOrigin(origin: string | undefined, env: NodeJS.ProcessEnv) {
  const origins = ["https://cactusdigitalmedia.ng", "https://www.cactusdigitalmedia.ng", "https://cactusdigitalmedia.vercel.app", ...(env.ALLOWED_ORIGINS || "").split(","), ...[env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter((host): host is string => !!host).map((host) => `https://${host}`)].map((value) => value.trim().replace(/\/$/, ""));
  return !!origin && origins.includes(origin);
}
async function rateLimit(req: VercelRequest) {
  const env = process.env; const redisUrl = env.UPSTASH_REDIS_REST_KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL; const redisToken = env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken || !env.RATE_LIMIT_SALT) throw new Error("rate_limit_unconfigured");
  const ip = String(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const hash = createHmac("sha256", env.RATE_LIMIT_SALT).update(ip).digest("hex"); const key = `cactus:inquiry:${hash}`;
  const r = await fetch(redisUrl.replace(/\/$/, ""), { method: "POST", headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" }, body: JSON.stringify(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n", "1", key]), signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error("rate_limit_unavailable"); const data = await r.json() as { result?: number }; if (typeof data.result !== "number") throw new Error("rate_limit_invalid"); return data.result <= 5;
}
function submissionId(project: boolean) { const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); return `CDM-${project ? "PRJ" : "CON"}-${date}-${randomBytes(4).toString("hex").toUpperCase()}`; }

export function createHandler(project = false) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader("Cache-Control", "no-store"); res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }
    if (!allowedOrigin(req.headers.origin, process.env)) return res.status(403).json({ error: "This origin is not permitted." });
    if (!String(req.headers["content-type"]).startsWith("application/json")) return res.status(415).json({ error: "Please submit JSON." });
    if (Number(req.headers["content-length"] || 0) > 16384) return res.status(413).json({ error: "Your message is too large." });
    let body: unknown = req.body; try { if (typeof body === "string") body = JSON.parse(body); if (Buffer.byteLength(JSON.stringify(body) || "") > 16384) return res.status(413).json({ error: "Your message is too large." }); } catch { return res.status(400).json({ error: "Invalid request." }); }
    const parsed = (project ? projectSchema : inquirySchema).safeParse(body); if (!parsed.success) return res.status(400).json({ error: "Please check the required fields, email address, and message length." });
    if ((parsed.data.smsInquiryConsent === "yes" || parsed.data.smsMarketingConsent === "yes") && !/^\+[1-9]\d{6,14}$/.test(parsed.data.phone)) return res.status(400).json({ error: "Please enter your mobile number with country code to opt into SMS (for example +2349032353823)." });
    if (parsed.data.fax) return res.status(400).json({ error: "Submission rejected." });
    try { if (!(await rateLimit(req))) { res.setHeader("Retry-After", "3600"); return res.status(429).json({ error: "Too many inquiries. Please try again later or contact us directly." }); } } catch { return res.status(503).json({ error: "The inquiry form is temporarily unavailable. Please contact us directly." }); }

    const d = parsed.data; const env = process.env; const id = submissionId(project); const receivedAt = new Date().toISOString(); const category = project ? "project-briefs" : "contacts";
    const consentRecord = { receivedAt, origin: req.headers.origin, source: d.formSource || (project ? "project" : "contact"), disclosureVersion: smsConsentVersion, mobile: d.phone, inquirySms: d.smsInquiryConsent === "yes", marketingSms: d.smsMarketingConsent === "yes", disclosures: smsConsents };
    const record = { schemaVersion: 1, submissionId: id, type: project ? "project-brief" : "contact", receivedAt, status: "new", applicant: undefined, inquiry: Object.fromEntries(Object.entries(d).filter(([k]) => !["fax"].includes(k))), smsConsent: consentRecord };
    try { await put(`submissions/${category}/${id}/submission.json`, JSON.stringify(record, null, 2), { access: "private", contentType: "application/json", addRandomSuffix: false }); }
    catch { console.error("Inquiry persistence failed; contents omitted."); return res.status(503).json({ error: "We could not safely save your inquiry. Please try again later or contact us directly." }); }

    let notification: "sent" | "failed" | "unconfigured" = "unconfigured";
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM && env.CONTACT_TO) {
      const transporter = nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), secure: (env.SMTP_PORT || "465") === "465", requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }, connectionTimeout: 8000, socketTimeout: 12000 });
      try {
        const result = await transporter.sendMail({ from: env.SMTP_FROM, to: env.CONTACT_TO, replyTo: d.email, subject: `[${id}] Cactus ${project ? "project brief" : "website inquiry"}: ${d.service}`, text: `Submission ID: ${id}\nReceived: ${receivedAt}\n\n` + Object.entries(d).filter(([k]) => !["fax", "consent"].includes(k)).map(([k, v]) => `${k}: ${v || "Not supplied"}`).join("\n\n") + "\n\nSMS consent record\n" + JSON.stringify(consentRecord, null, 2) });
        notification = result.accepted?.length ? "sent" : "failed";
      } catch { notification = "failed"; console.error("Inquiry notification failed; contents omitted."); } finally { transporter.close(); }
    }
    try { await put(`submissions/${category}/${id}/notification.json`, JSON.stringify({ submissionId: id, attemptedAt: new Date().toISOString(), channel: "email", status: notification }, null, 2), { access: "private", contentType: "application/json", addRandomSuffix: false }); } catch { console.error("Inquiry notification status persistence failed."); }
    return res.status(200).json({ ok: true, submissionId: id, notification });
  };
}
