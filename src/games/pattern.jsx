// What Comes Next?: finish the repeating pattern. Practises pattern recognition.
import { Quiz } from "./shell.jsx";
import { shuffle } from "./sound.js";
const { useState } = React;

const SHAPES = {
  circle:   <circle cx="50" cy="50" r="40"/>,
  square:   <rect x="13" y="13" width="74" height="74" rx="12"/>,
  triangle: <path d="M50 12 L90 84 H10 Z" strokeLinejoin="round" strokeWidth="8"/>,
  star:     <path d="M50 8 L61.8 36.6 92 39.4 69 59.6 76 89.5 50 73.5 24 89.5 31 59.6 8 39.4 38.2 36.6 Z" strokeLinejoin="round" strokeWidth="6"/>,
  heart:    <path d="M50 86 C18 62 10 44 10 32 a20 20 0 0 1 40 -6 a20 20 0 0 1 40 6 C90 44 82 62 50 86 Z"/>,
};
const COLOURS = [["red", "#E5836F"], ["blue", "#6FA8CF"], ["yellow", "#E3B341"], ["green", "#7DB58C"], ["purple", "#A08FD6"]];

// Every piece differs from the others in BOTH shape and colour, so the game never depends on telling colours apart.
const Piece = ({ t }) => <svg viewBox="0 0 100 100" aria-hidden="true"><g fill={t.hex} stroke={t.hex}>{SHAPES[t.shape]}</g></svg>;

// Each pattern is the pieces shown (0 = first piece, 1 = second...) and the piece that comes next.
const PATTERNS = {
  easy:   [[[0,1,0,1], 0], [[0,1,0,1,0], 1], [[0,1,0,1,0,1], 0]],
  medium: [[[0,1,2,0,1,2], 0], [[0,1,2,0,1], 2], [[0,0,1,0,0], 1], [[0,1,1,0,1], 1], [[0,0,1,1,0,0], 1]],
  tricky: [[[0,1,2,3,0,1,2], 3], [[0,0,1,2,0,0,1], 2], [[0,1,0,2,0,1,0], 2], [[0,1,1,2,0,1,1], 2], [[0,0,1,1,2,2,0], 0]],
};
const CHOICES = { easy: 2, medium: 3, tricky: 4 };

function makeRound(level, n, [seq, answer]) {
  const shapes = shuffle(Object.keys(SHAPES)), colours = shuffle(COLOURS);
  const pieces = shapes.map((shape, i) => ({ shape, name: `${colours[i][0]} ${shape}`, hex: colours[i][1] })).slice(0, CHOICES[level]);
  const choices = shuffle(pieces.map((t, i) => ({ t, correct: i === answer })))
    .map((c, i) => ({ key: n + "-" + i, node: <Piece t={c.t}/>, label: c.t.name, correct: c.correct }));
  const prompt = (solved) => (
    <div>
      <p className="g-prompt">What comes next?</p>
      <div className="g-seq" role="img" aria-label={`Pattern: ${seq.map(s => pieces[s].name).join(", ")}, then what?`} style={{ "--n": seq.length + 1 }}>
        {seq.map((s, i) => <span key={i}><Piece t={pieces[s]}/></span>)}
        <span className={"g-slot" + (solved ? " filled" : "")}>{solved ? <Piece t={pieces[answer]}/> : "?"}</span>
      </div>
    </div>);
  return { prompt, choices };
}

export function PatternPlay({ level, report, done }) {
  const [rounds] = useState(() => {
    const list = PATTERNS[level];
    let order = [];
    while (order.length < 6) { // every pattern once before any repeats, and never the same one twice in a row
      const more = shuffle(list);
      if (order.length && more[0] === order[order.length - 1]) more.push(more.shift());
      order = order.concat(more);
    }
    return order.slice(0, 6).map((p, n) => makeRound(level, n, p));
  });
  return <Quiz rounds={rounds} report={report} done={done} cls="g-pat"/>;
}
