// Sounds, speech and saved stars. Everything stays on the device: nothing here talks to a server.
let ctx = null;
let muted = false;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode: just don't remember */ } },
};

export function loadMuted() { muted = store.get("lilthink.mute") === "1"; return muted; }
export function setMuted(m) {
  muted = m; store.set("lilthink.mute", m ? "1" : "0");
  if (m && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

// Short, soft tones made in the browser, so there are no sound files to download.
function tone(freq, at, dur, type = "sine", vol = 0.16) {
  if (muted) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* no sound is fine */ }
}
export const sfx = {
  tap() { tone(520, 0, 0.08, "triangle", 0.1); },
  good() { tone(660, 0, 0.14); tone(880, 0.12, 0.2); },
  bad() { tone(240, 0, 0.18, "sine", 0.1); },
  note(i) { tone([392, 494, 587, 698, 784][i % 5], 0, 0.32, "triangle", 0.2); }, // one note per pad or light
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.26)); },
};

// Reads a prompt aloud for children who cannot read yet. force = the child pressed the speaker button.
export function say(text, force = false) {
  if ((muted && !force) || typeof speechSynthesis === "undefined") return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en"; u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  } catch { /* no speech is fine */ }
}

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
