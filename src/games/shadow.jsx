// Shadow Match: which shadow belongs to the picture? Practises spatial reasoning (on Tricky the shadows are turned around).
import { Quiz } from "./shell.jsx";
import { shuffle, sample, pick } from "./sound.js";
const { useState } = React;

// Pictures with clear, different outlines
const THINGS = [["🐘","elephant"],["🐇","rabbit"],["🚗","car"],["🚲","bicycle"],["✈️","aeroplane"],["🍌","banana"],["⭐","star"],["🐟","fish"],["🦋","butterfly"],
  ["🦒","giraffe"],["🌵","cactus"],["☂️","umbrella"],["🔑","key"],["✂️","scissors"],["🚀","rocket"],["🌳","tree"],["🦆","duck"],["🐌","snail"],["🐢","turtle"],
  ["🎸","guitar"],["🔔","bell"],["👑","crown"],["👢","boot"],["🏠","house"],["🍐","pear"],["🚂","train"]];
const COUNT = { easy: 2, medium: 3, tricky: 4 };

function makeRound(level, n, things) {
  const answer = things[0];
  const choices = shuffle(things).map((t, i) => ({
    key: n + "-" + i, label: `shadow of the ${t[1]}`, correct: t === answer,
    node: <span className="g-emo g-shadow" aria-hidden="true" style={level === "tricky" ? { transform: `rotate(${pick([90, 180, 270])}deg)` } : null}>{t[0]}</span>,
  }));
  return {
    prompt: <div className="g-show"><span className="g-emo" role="img" aria-label={answer[1]}>{answer[0]}</span><p className="g-prompt">Which shadow fits?</p></div>,
    choices, after: `Yes! That is the ${answer[1]}'s shadow.`,
  };
}

export function ShadowPlay({ level, report, done }) {
  const [rounds] = useState(() => {
    const answers = sample(THINGS, 6); // six different pictures to find
    return answers.map((a, n) => makeRound(level, n, [a, ...sample(THINGS.filter(t => t !== a), COUNT[level] - 1)]));
  });
  return <Quiz rounds={rounds} report={report} done={done} cls="g-shad"/>;
}
