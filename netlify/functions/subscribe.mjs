// Netlify entry point. Reuses the same logic as api/subscribe.js, so there is only one version to maintain.
import handler from "../../api/subscribe.js";

export default async (req) => {
  let body = null;
  try { body = await req.json(); } catch { /* invalid JSON is rejected by the handler */ }
  const out = { status: 200, headers: {}, json: {} };
  const res = {
    setHeader: (k, v) => { out.headers[k] = v; },
    status(c) { out.status = c; return this; },
    json(j) { out.json = j; return this; },
  };
  await handler({ method: req.method, headers: Object.fromEntries(req.headers), body }, res);
  return new Response(JSON.stringify(out.json), { status: out.status, headers: { ...out.headers, "Content-Type": "application/json" } });
};

export const config = { path: "/api/subscribe" };
