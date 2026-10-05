import { createHmac } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const roles = ["Client Acquisition & Sales Assistant", "Junior Developer"] as const;
const text = (max: number) => z.string().trim().max(max);
const fileSchema = z.object({ name: text(180), type: text(120), data: z.string().max(2_900_000) }).nullable();
const schema = z.object({
  name: text(100).min(2), email: z.email().max(254), phone: text(40).min(7), location: text(120).min(2),
  role: z.enum(roles), linkedin: text(500).optional().default(""), portfolio: text(500).optional().default(""),
  education: text(1500).min(2), experience: text(2500).min(2), skills: text(1500).min(2),
  availability: text(40).min(1), motivation: text(2000).min(30), consent: z.literal("yes"),
  fax: text(200).optional().default(""), resume: fileSchema.refine((f) => !!f, "Resume required"), result: fileSchema.optional().default(null),
}).strict();

function allowedOrigin(origin: string | undefined) {
  const env = process.env;
  const origins = ["https://cactusdigitalmedia.ng", "https://www.cactusdigitalmedia.ng", "https://cactusdigitalmedia.vercel.app", ...(env.ALLOWED_ORIGINS || "").split(","), ...[env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map((h) => `https://${h}`)].map((v) => v.trim().replace(/\/$/, ""));
  return !!origin && origins.includes(origin);
}

async function rateLimit(req: VercelRequest) {
  const env = process.env;
  const url = env.UPSTASH_REDIS_REST_KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !env.RATE_LIMIT_SALT) throw new Error("rate_limit_unconfigured");
  const ip = String(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const hash = createHmac("sha256", env.RATE_LIMIT_SALT).update(ip).digest("hex");
  const r = await fetch(url.replace(/\/$/, ""), { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n", "1", `cactus:career:${hash}`]), signal: AbortSignal.timeout(5000) });
  const data = await r.json() as { result?: number };
  return r.ok && typeof data.result === "number" && data.result <= 5;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store"); res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: "This origin is not permitted." });
  if (!String(req.headers["content-type"]).startsWith("application/json")) return res.status(415).json({ error: "Please submit JSON." });
  if (Number(req.headers["content-length"] || 0) > 6_000_000) return res.status(413).json({ error: "Application files are too large." });
  const parsed = schema.safeParse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check all required fields and file limits." });
  const d = parsed.data;
  if (d.fax) return res.status(400).json({ error: "Submission rejected." });
  const env = process.env;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM || !env.CONTACT_TO) return res.status(503).json({ error: "Applications are temporarily unavailable. Please try again later." });
  try { if (!(await rateLimit(req))) return res.status(429).json({ error: "Too many applications. Please try again later." }); } catch { return res.status(503).json({ error: "Applications are temporarily unavailable. Please try again later." }); }
  const transporter = nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), secure: (env.SMTP_PORT || "465") === "465", requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }, connectionTimeout: 8000, socketTimeout: 12000 });
  try {
    const fields = [["Name", d.name], ["Email", d.email], ["Phone", d.phone], ["Location", d.location], ["Position", d.role], ["LinkedIn", d.linkedin], ["Portfolio / GitHub", d.portfolio], ["Education", d.education], ["Experience", d.experience], ["Skills", d.skills], ["Earliest start date", d.availability], ["Why Cactus Digital Media", d.motivation]];
    const attachments = [d.resume, d.result].filter((f): f is NonNullable<typeof f> => !!f).map((f) => ({ filename: f.name.replace(/[\\/]/g, "_"), content: Buffer.from(f.data, "base64"), contentType: f.type }));
    const result = await transporter.sendMail({ from: env.SMTP_FROM, to: env.CONTACT_TO, replyTo: d.email, subject: `Career application — ${d.role} — ${d.name}`, text: fields.map(([k,v]) => `${k}: ${v || "Not supplied"}`).join("\n\n") + `\n\nConsent: Yes\nReceived: ${new Date().toISOString()}`, attachments });
    if (!result.accepted?.length) throw new Error("not_accepted");
    return res.status(200).json({ ok: true });
  } catch { console.error("Career application delivery failed; applicant contents omitted."); return res.status(502).json({ error: "Your application could not be delivered. Please try again later." }); }
  finally { transporter.close(); }
}
