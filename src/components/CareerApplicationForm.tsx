import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Arrow } from "./Shared";

const roles = ["Client Acquisition & Sales Assistant", "Junior Developer", "Social Media Management"];
const MAX_FILE = 2 * 1024 * 1024;
const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];

async function encodeFile(file: File | null) {
  if (!file) return null;
  if (file.size > MAX_FILE) throw new Error(`${file.name} is larger than 2 MB.`);
  if (!allowed.includes(file.type)) throw new Error(`${file.name} must be PDF, DOCX, JPG, or PNG.`);
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
  return { name: file.name, type: file.type, data };
}

export default function CareerApplicationForm() {
  const [params] = useSearchParams();
  const requestedRole = params.get("role") || "";
  const defaultRole = roles.includes(requestedRole) ? requestedRole : "";
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    setMessage("");
    try {
      const fd = new FormData(form);
      const resume = fd.get("resume") as File | null;
      const result = fd.get("result") as File | null;
      const data = {
        name: String(fd.get("name") || ""), email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""), location: String(fd.get("location") || ""),
        role: String(fd.get("role") || ""), linkedin: String(fd.get("linkedin") || ""),
        portfolio: String(fd.get("portfolio") || ""), education: String(fd.get("education") || ""),
        experience: String(fd.get("experience") || ""), availability: String(fd.get("availability") || ""),
        motivation: String(fd.get("motivation") || ""), skills: String(fd.get("skills") || ""),
        consent: String(fd.get("consent") || ""), fax: String(fd.get("fax") || ""),
        resume: await encodeFile(resume?.size ? resume : null),
        result: await encodeFile(result?.size ? result : null),
      };
      const response = await fetch("/api/careers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), signal: AbortSignal.timeout(30000),
      });
      const resultBody = await response.json();
      if (!response.ok) throw new Error(resultBody.error || "Application could not be submitted.");
      setState("success");
      setMessage("Application received. Thank you for your interest in Cactus Digital Media. We’ll review your application and contact you if your profile is selected for the next stage.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Application could not be submitted. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="inquiry-form">
      <div className="form-grid">
        <label>Full name <span>*</span><input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
        <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Mobile / WhatsApp number <span>*</span><input name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+234…" /></label>
        <label>Current location <span>*</span><input name="location" required maxLength={120} placeholder="City, State / Country" /></label>
        <label className="full">Position applying for <span>*</span><select name="role" required defaultValue={defaultRole}><option value="" disabled>Select a position</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
        <label>LinkedIn profile<input name="linkedin" type="url" placeholder="https://linkedin.com/in/..." maxLength={500} /></label>
        <label>Portfolio / GitHub / website<input name="portfolio" type="url" placeholder="https://" maxLength={500} /></label>
        <label className="full">Education / qualification <span>*</span><textarea name="education" required rows={3} maxLength={1500} placeholder="School, qualification, course of study and graduation year (or current status)." /></label>
        <label className="full">Relevant work experience <span>*</span><textarea name="experience" required rows={4} maxLength={2500} placeholder="Briefly describe your most relevant roles, responsibilities, internships, freelance or volunteer experience." /></label>
        <label className="full">Key skills <span>*</span><textarea name="skills" required rows={3} maxLength={1500} placeholder="List the skills most relevant to the position." /></label>
        <label>Earliest start date <span>*</span><input name="availability" type="date" required /></label>
        <label className="full">Why do you want to join Cactus Digital Media? <span>*</span><textarea name="motivation" required minLength={30} maxLength={2000} rows={4} /></label>
        <label className="full">CV / Résumé <span>*</span><input name="resume" type="file" required accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><small>PDF or DOCX, maximum 2 MB.</small></label>
        <label className="full">Academic result / certificate <span>(optional)</span><input name="result" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" /><small>Transcript, result or relevant certificate. PDF, JPG or PNG, maximum 2 MB.</small></label>
      </div>
      <div className="honey" aria-hidden="true"><label>Leave this field empty<input name="fax" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="consent"><input type="checkbox" name="consent" value="yes" required /><span>I confirm that the information supplied is accurate and consent to Cactus Digital Media processing my application information for recruitment purposes in accordance with the <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span></label>
      <button className="button dark" disabled={state === "sending"} type="submit">{state === "sending" ? "Submitting…" : "Submit application"}<Arrow diagonal /></button>
      <p className={`form-status ${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite">{message}</p>
    </form>
  );
}
