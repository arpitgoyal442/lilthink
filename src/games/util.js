// Saved stars and level, plus small random helpers. Everything stays on the device: nothing here talks to a server.

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode: just don't remember */ } },
};

export function loadStars() { try { return JSON.parse(store.get("lilthink.stars") || "{}") || {}; } catch { return {}; } }
export function saveStars(id, n) {
  const all = loadStars();
  if (!(all[id] >= n)) { all[id] = n; store.set("lilthink.stars", JSON.stringify(all)); }
}
export function loadLevel() { return store.get("lilthink.level"); }
export function saveLevel(l) { store.set("lilthink.level", l); }

export const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const sample = (a, n) => shuffle(a).slice(0, n);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
