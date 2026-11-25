// Switch It!: sort by colour, then the rule changes to shape. Practises cognitive flexibility (letting go of the old rule).
import { Quiz } from "./shell.jsx";
import { sample, pick } from "./sound.js";
import { SHAPES, COLOURS, Piece } from "./pattern.jsx";
const { useState } = React;

// Which rule applies in each round. Easy changes once, Medium twice, Tricky can change at any time.
function rules(level) {
  const [a, b] = Math.random() < 0.5 ? ["colour", "shape"] : ["shape", "colour"];
  if (level === "easy") return [a, a, a, a, b, b, b, b];
  if (level === "medium") return [a, a, a, b, b, b, a, a, a];
  const out = [a];
  while (out.length < 10) { // runs of one or two, so the rule keeps changing
    const last = out[out.length - 1], twice = out.length > 1 && out[out.length - 2] === last;
    out.push(twice || Math.random() < 0.6 ? (last === "colour" ? "shape" : "colour") : last);
  }
  return out;
}

const Swatch = ({ hex }) => <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 9c24 0 41 15 41 39S76 92 50 92 9 74 9 48 26 9 50 9z" fill={hex}/></svg>;
const Outline = ({ shape }) => <svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#12352B" strokeWidth="7" strokeLinejoin="round" transform="translate(8 8) scale(.84)">{SHAPES[shape]}</g></svg>;

function makeRounds(level) {
  // Colour pairs that stay easy to tell apart for children with colour-blindness (never red with green)
  const colours = pick([["red", "blue"], ["yellow", "blue"], ["yellow", "purple"], ["green", "purple"]]).map(name => COLOURS.find(c => c[0] === name));
  const shapes = sample(Object.keys(SHAPES), 2);
  const list = rules(level);
  return list.map((rule, n) => {
    // Mostly pieces where the two rules disagree (a red star when red goes left and stars go right): those are the ones that need thought
    const ci = pick([0, 1]), si = Math.random() < 0.75 ? 1 - ci : ci;
    const piece = { shape: shapes[si], hex: colours[ci][1], name: `${colours[ci][0]} ${shapes[si]}` };
    const isNew = n > 0 && list[n - 1] !== rule;
    const choices = [0, 1].map(i => rule === "colour"
      ? { key: `${n}-${i}`, label: colours[i][0], correct: i === ci, node: <span className="g-bin"><Swatch hex={colours[i][1]}/><em>{colours[i][0]}</em></span> }
      : { key: `${n}-${i}`, label: shapes[i], correct: i === si, node: <span className="g-bin"><Outline shape={shapes[i]}/><em>{shapes[i]}</em></span> });
    return {
      prompt: <div className="g-sw">
        <p className={"g-rule " + rule + (isNew ? " new" : "")}>{isNew ? "Now sort by " : "Sort by "}<b>{rule}</b></p>
        <div className="g-piece" role="img" aria-label={piece.name}><Piece t={piece}/></div>
      </div>,
      say: isNew ? `Now sort by ${rule}!` : `Sort by ${rule}.`, quiet: n > 0 && !isNew, // read aloud at the start and whenever the rule changes
      choices,
    };
  });
}

export function SwitchPlay({ level, report, done }) {
  const [rounds] = useState(() => makeRounds(level));
  return <Quiz rounds={rounds} report={report} done={done} cls="g-switch"/>;
}
