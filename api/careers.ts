import { createHmac, randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
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

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 120) || "file";
}

async function storeFile(applicationId: string, kind: "resume" | "result", file: NonNullable<z.infer<typeof fileSchema>>) {
  if (!file) return null;
  const blob = await put(`careers/${applicationId}/${kind}-${safeName(file.name)}`, Buffer.from(file.data, "base64"), {
    access: "private",
    contentType: file.type || "application/octet-stream",
    addRandomSuffix: false,
  });
  return { name: file.name, type: file.type, pathname: blob.pathname, url: blob.url };
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
  if (!env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: "Applications are temporarily unavailable. Please try again later." });
  try { if (!(await rateLimit(req))) return res.status(429).json({ error: "Too many applications. Please try again later." }); } catch { return res.status(503).json({ error: "Applications are temporarily unavailable. Please try again later." }); }

  const applicationId = `CDM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  const receivedAt = new Date().toISOString();
  let storedResume: Awaited<ReturnType<typeof storeFile>>;
  let storedResult: Awaited<ReturnType<typeof storeFile>>;
  try {
    storedResume = await storeFile(applicationId, "resume", d.resume);
    storedResult = d.result ? await storeFile(applicationId, "result", d.result) : null;
    await put(`careers/${applicationId}/application.json`, JSON.stringify({
      applicationId, receivedAt, status: "received", notificationStatus: "pending",
      applicant: { name: d.name, email: d.email, phone: d.phone, location: d.location },
      role: d.role, linkedin: d.linkedin, portfolio: d.portfolio, education: d.education,
      experience: d.experience, skills: d.skills, availability: d.availability, motivation: d.motivation,
      consent: true, files: { resume: storedResume, result: storedResult },
    }, null, 2), { access: "private", contentType: "application/json", addRandomSuffix: false });
  } catch (error) {
    console.error("Career application storage failed; applicant contents omitted.", error instanceof Error ? error.message : "unknown");
    return res.status(503).json({ error: "Your application could not be safely stored. Please try again later." });
  }

  let notificationStatus: "sent" | "failed" | "unconfigured" = "unconfigured";
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM && env.CONTACT_TO) {
    const transporter = nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 465), secure: (env.SMTP_PORT || "465") === "465", requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }, connectionTimeout: 8000, socketTimeout: 12000 });
    try {
      const fields = [["Application ID", applicationId], ["Name", d.name], ["Email", d.email], ["Phone", d.phone], ["Location", d.location], ["Position", d.role], ["LinkedIn", d.linkedin], ["Portfolio / GitHub", d.portfolio], ["Education", d.education], ["Experience", d.experience], ["Skills", d.skills], ["Earliest start date", d.availability], ["Why Cactus Digital Media", d.motivation]];
      const attachments = [d.resume, d.result].filter((f): f is NonNullable<typeof f> => !!f).map((f) => ({ filename: safeName(f.name), content: Buffer.from(f.data, "base64"), contentType: f.type }));
      const mail = await transporter.sendMail({ from: env.SMTP_FROM, to: env.CONTACT_TO, replyTo: d.email, subject: `Career application — ${d.role} — ${d.name} — ${applicationId}`, text: fields.map(([k,v]) => `${k}: ${v || "Not supplied"}`).join("\n\n") + `\n\nConsent: Yes\nReceived: ${receivedAt}\nStorage: Application safely persisted before this notification was attempted.`, attachments });
      notificationStatus = mail.accepted?.length ? "sent" : "failed";
    } catch {
      notificationStatus = "failed";
      console.error(`Career notification failed for ${applicationId}; application remains safely stored.`);
    } finally { transporter.close(); }
  }

  try {
    await put(`careers/${applicationId}/delivery.json`, JSON.stringify({ applicationId, notificationStatus, updatedAt: new Date().toISOString() }, null, 2), { access: "private", contentType: "application/json", addRandomSuffix: false });
  } catch { console.error(`Career delivery status write failed for ${applicationId}.`); }

  return res.status(200).json({ ok: true, applicationId, notificationStatus });
}
