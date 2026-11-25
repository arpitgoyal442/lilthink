// POST /api/subscribe  (Vercel serverless function; the same logic ports to Netlify / Cloudflare Workers)
// Flow: validate email + consent -> skip if already a contact -> save contact in Resend ->
//       send welcome email from your domain -> add a row to the Google Sheet -> (optional) notify n8n.
//       Secrets live in env vars only.
import { SUBJECT, HTML, TEXT } from "./_welcome.js";
import { addSubscriberToSheet } from "./_sheet.js";

const RESEND = "https://api.resend.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const env = (k, d = "") => (process.env[k] || d).trim();

const resend = (path, init = {}) =>
  fetch(RESEND + path, {
    ...init,
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(8000),
  });

async function sha(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  // ref is a short, non-secret code saying which step failed (e.g. "lookup-401"), to make problems easy to report
  const fail = (code, error, ref) => res.status(code).json(ref ? { error, ref } : { error });

  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return fail(405, "Method not allowed."); }
  if (!env("RESEND_API_KEY")) { console.error("RESEND_API_KEY is not set"); return fail(500, "Signup is temporarily unavailable. Please try again later."); }

  // Only accept requests from your own site (set ALLOWED_ORIGINS="https://lilthink.com,https://www.lilthink.com")
  const allowed = env("ALLOWED_ORIGINS").split(",").map(s => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(req.headers.origin || "")) return fail(403, "Request not allowed.");

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object") return fail(400, "Invalid request.");

  // Validate on the server too: never trust the browser
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return fail(400, "Please enter a valid email address, like name@example.com.");
  if (body.consent !== true) return fail(400, "Please agree to receive daily activity emails to subscribe.");

  try {
    // 1) Prevent duplicates: one contact per email
    const existing = await resend(`/contacts/${encodeURIComponent(email)}`);
    if (existing.ok) return res.status(200).json({ status: "already_subscribed" });
    if (existing.status !== 404) { console.error("contact lookup failed", existing.status, await existing.text()); return fail(502, "We couldn’t sign you up just now. Please try again in a moment.", `lookup-${existing.status}`); }

    // 2) Save the contact (only reached with valid email + consent)
    const segment = env("RESEND_SEGMENT_ID");
    const created = await resend("/contacts", {
      method: "POST",
      body: JSON.stringify({ email, unsubscribed: false, ...(segment ? { segments: [{ id: segment }] } : {}) }),
    });
    if (!created.ok) {
      const text = await created.text();
      if (created.status === 409 || /already|exist/i.test(text)) return res.status(200).json({ status: "already_subscribed" });
      console.error("contact create failed", created.status, text);
      return fail(502, "We couldn’t sign you up just now. Please try again in a moment.", `create-${created.status}`);
    }

    // 3) Welcome email from your own domain
    const sent = await resend("/emails", {
      method: "POST",
      headers: { "Idempotency-Key": `welcome-${await sha(email)}` },
      body: JSON.stringify({
        from: env("FROM_EMAIL", "Lil Think <hello@lilthink.com>"),
        to: [email],
        reply_to: env("REPLY_TO", "hello@lilthink.com"),
        subject: SUBJECT, html: HTML, text: TEXT,
        headers: { "List-Unsubscribe": `<mailto:${env("REPLY_TO", "hello@lilthink.com")}?subject=unsubscribe>` },
      }),
    });
    if (!sent.ok) {
      console.error("welcome email failed", sent.status, await sent.text());
      await resend(`/contacts/${encodeURIComponent(email)}`, { method: "DELETE" }).catch(() => {}); // roll back so they can retry
      return fail(502, "We couldn’t send your welcome email. Please try again in a moment.", `send-${sent.status}`);
    }

    // 4) Add the subscriber to the Google Sheet (balance 100, question id 1). Awaited so the function is not
    //    stopped before the row is written; a failure is logged and never blocks the signup.
    await addSubscriberToSheet({ email, subscribedAt: new Date().toISOString(), source: String(body.source || "landing").slice(0, 40) });

    // 5) Optional: tell n8n (best effort, never blocks the signup). The secret stays server-side.
    if (env("N8N_WEBHOOK_URL")) {
      fetch(env("N8N_WEBHOOK_URL"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(env("N8N_WEBHOOK_SECRET") ? { "X-Webhook-Secret": env("N8N_WEBHOOK_SECRET") } : {}) },
        body: JSON.stringify({ event: "subscribed", email, consent: true, consentText: String(body.consentText || "").slice(0, 300), consentAt: String(body.consentAt || ""), source: String(body.source || "landing").slice(0, 40) }),
        signal: AbortSignal.timeout(4000),
      }).catch(e => console.error("n8n webhook failed", e.message));
    }

    return res.status(200).json({ status: "subscribed" });
  } catch (e) {
    console.error("subscribe error", e);
    return fail(502, "We couldn’t sign you up just now. Please try again in a moment.", `error-${e && e.name || "unknown"}`);
  }
}
