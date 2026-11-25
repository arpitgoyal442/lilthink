// Copy the Lights: watch the pads light up, then tap them in the same order. Practises working memory.
import { starsFor } from "./shell.jsx";
import { SHAPES } from "./pattern.jsx";
const { useState, useEffect, useRef } = React;

const PADS = [["red", "#E5836F", "circle"], ["blue", "#6FA8CF", "square"], ["yellow", "#E3B341", "triangle"], ["green", "#7DB58C", "star"]];
// lens: how many lights in each round. gap: milliseconds between lights.
const PLAN = {
  easy:   { pads: 3, lens: [2, 2, 3, 3],    gap: 900 },
  medium: { pads: 4, lens: [2, 3, 3, 4, 4], gap: 720 },
  tricky: { pads: 4, lens: [3, 4, 4, 5, 5], gap: 580 },
};

function makeSeq(len, pads) { // never the same pad twice in a row, so each flash is easy to see
  const s = [];
  while (s.length < len) { const p = Math.floor(Math.random() * pads); if (p !== s[s.length - 1]) s.push(p); }
  return s;
}

export function LightsPlay({ level, report, done }) {
  const plan = PLAN[level], total = plan.lens.length;
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState(() => makeSeq(plan.lens[0], plan.pads));
  const [phase, setPhase] = useState("watch"); // watch | turn | yay | oops
  const [lit, setLit] = useState(-1);
  const [pos, setPos] = useState(0);
  const firstTry = useRef(0), clean = useRef(true), timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const show = (s) => {
    stop(); setPhase("watch"); setPos(0); setLit(-1);
    s.forEach((p, i) => {
      later(() => { setLit(p); }, 800 + i * plan.gap);
      later(() => setLit(-1), 800 + i * plan.gap + plan.gap * 0.62);
    });
    later(() => setPhase("turn"), 800 + s.length * plan.gap);
  };
  useEffect(() => { report(0, total); show(seq); return stop; }, []);

  const tap = (p) => {
    if (phase !== "turn") return;
    if (p !== seq[pos]) { // wrong pad: nothing is lost, the same lights are shown again
      clean.current = false; setPhase("oops"); setLit(-1);
      later(() => show(seq), 1500);
      return;
    }
    setLit(p); later(() => setLit(-1), 240);
    if (pos + 1 < seq.length) { setPos(pos + 1); return; }
    if (clean.current) firstTry.current++;
    setPos(seq.length); setPhase("yay"); report(round + 1, total);
    later(() => {
      if (round + 1 === total) { done(starsFor(firstTry.current, total)); return; }
      const next = makeSeq(plan.lens[round + 1], plan.pads);
      clean.current = true; setRound(round + 1); setSeq(next); show(next);
    }, 1500);
  };

  const message = { watch: "Watch the lights...", turn: "Your turn! Tap them in the same order.", yay: "You remembered!", oops: "Nearly! Watch again." }[phase];
  return (
    <div className="g-lights">
      <p className="g-prompt" role="status">{message}</p>
      <div className="g-count" role="img" aria-label={`${pos} of ${seq.length} tapped`}>{seq.map((_, i) => <i key={i} className={i < pos ? "on" : ""}/>)}</div>
      <div className={"g-pads p" + plan.pads + (lit >= 0 ? " has-lit" : "") + (phase === "turn" ? " go" : "")}>
        {PADS.slice(0, plan.pads).map(([name, hex, shape], p) => (
          <button key={name} className={"g-pad" + (lit === p ? " lit" : "")} style={{ background: hex }} aria-label={`${name} ${shape}`}
            aria-disabled={phase !== "turn"} onClick={() => tap(p)}>
            <svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#fff" stroke="#fff" opacity=".92">{SHAPES[shape]}</g></svg>
          </button>))}
      </div>
      <button className="btn o g-small" disabled={phase !== "turn"} onClick={() => show(seq)}>Show me again</button>
    </div>
  );
}
