// Adds a new subscriber to the Google Sheet through the Apps Script web app in google-apps-script/Code.gs.
// Starting values for every new subscriber live here.
export const START_BALANCE = 100;
export const START_QUESTION_ID = 1;

const env = (k) => (process.env[k] || "").trim();

// Returns { ok, status, reason } and never throws: a sheet problem must not break a signup.
// status is "added", "exists", "skipped" (not configured) or "failed".
// reason is a short, non-secret code saying why a row was not written (e.g. "unauthorized", "no_email_column").
export async function addSubscriberToSheet({ email, subscribedAt, source }) {
  const url = env("SHEETS_WEBHOOK_URL");
  if (!url) { console.error("sheet write skipped: SHEETS_WEBHOOK_URL is not set"); return { ok: true, status: "skipped", reason: "url-not-set" }; }
  if (!/\/exec(\?|$)/.test(url)) console.error("SHEETS_WEBHOOK_URL should be the web app URL ending in /exec");

  const payload = JSON.stringify({
    secret: env("SHEETS_WEBHOOK_SECRET"),
    email, balance: START_BALANCE, questionId: START_QUESTION_ID, subscribedAt, source,
  });

  let lastError = "", reason = "";
  for (let attempt = 1; attempt <= 2; attempt++) { // the script skips emails it already has, so a retry cannot duplicate a row
    try {
      // Apps Script answers a POST with a redirect to the real response; fetch follows it.
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, redirect: "follow", signal: AbortSignal.timeout(8000) });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.ok) return { ok: true, status: data.status };
      // Not JSON means Google answered with a login or error page: wrong URL, access not "Anyone", or the script crashed.
      reason = data ? String(data.error || "script-error").slice(0, 40) : `not-json-${res.status}`;
      lastError = `HTTP ${res.status} ${data ? JSON.stringify(data) : "(response was not JSON: check the web app is deployed with access set to Anyone)"}`;
      if (data && data.error === "unauthorized") break; // wrong secret: retrying will not help
    } catch (e) { lastError = e.message; reason = e.name === "TimeoutError" ? "timeout" : "network"; }
  }
  console.error("sheet write failed for", email, "-", lastError);
  return { ok: false, status: "failed", reason };
}
