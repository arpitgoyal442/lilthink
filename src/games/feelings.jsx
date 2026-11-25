// How Do They Feel?: find the face that matches a feeling, or that fits a little story. Practises social understanding.
import { Quiz } from "./shell.jsx";
import { shuffle, sample, pick } from "./sound.js";
const { useState } = React;

const LOOKS = [{ skin: "#EDBE95", hair: "#4A2F25" }, { skin: "#C98F68", hair: "#2B1D17" }, { skin: "#F3D2B3", hair: "#B5762E" }, { skin: "#8E5B3F", hair: "#1F1512" }];
const ink = "#33231C";
const line = { stroke: ink, strokeWidth: 3.5, strokeLinecap: "round", fill: "none" };

// What changes between feelings: eyebrows, eyes and mouth.
const PARTS = {
  happy: <>
    <path d="M27 37 q9 -6 17 -1 M56 36 q8 -5 17 1" {...line}/>
    <circle cx="36" cy="48" r="4.5" fill={ink}/><circle cx="64" cy="48" r="4.5" fill={ink}/>
    <circle cx="25" cy="60" r="6" fill="#E5836F" opacity=".45"/><circle cx="75" cy="60" r="6" fill="#E5836F" opacity=".45"/>
    <path d="M32 62 Q50 84 68 62 Z" fill="#fff" stroke={ink} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,
  sad: <>
    <path d="M27 39 L43 33 M73 39 L57 33" {...line}/>
    <circle cx="36" cy="49" r="4.5" fill={ink}/><circle cx="64" cy="49" r="4.5" fill={ink}/>
    <path d="M68 56 q-5 9 0 12 q5 -3 0 -12 Z" fill="#6FA8CF"/>
    <path d="M36 74 Q50 61 64 74" {...line}/>
  </>,
  angry: <>
    <path d="M26 32 L44 40 M74 32 L56 40" {...line} strokeWidth="4.5"/>
    <circle cx="36" cy="49" r="4.5" fill={ink}/><circle cx="64" cy="49" r="4.5" fill={ink}/>
    <circle cx="24" cy="60" r="7" fill="#D9482B" opacity=".4"/><circle cx="76" cy="60" r="7" fill="#D9482B" opacity=".4"/>
    <path d="M36 74 Q50 64 64 74 Z" fill={ink} stroke={ink} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,
  surprised: <>
    <path d="M27 31 q9 -7 17 -2 M56 29 q8 -5 17 2" {...line}/>
    <circle cx="36" cy="47" r="7.5" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="36" cy="47" r="3.2" fill={ink}/>
    <circle cx="64" cy="47" r="7.5" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="64" cy="47" r="3.2" fill={ink}/>
    <ellipse cx="50" cy="72" rx="7.5" ry="9.5" fill={ink}/>
  </>,
  scared: <>
    <path d="M27 36 L43 29 M73 36 L57 29" {...line}/>
    <circle cx="36" cy="47" r="7.5" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="36" cy="49" r="2.6" fill={ink}/>
    <circle cx="64" cy="47" r="7.5" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="64" cy="49" r="2.6" fill={ink}/>
    <path d="M33 71 q4.25 -7 8.5 0 t8.5 0 t8.5 0 t8.5 0" {...line}/>
  </>,
  sleepy: <>
    <path d="M28 40 q8 -3 16 0 M56 40 q8 -3 16 0" {...line}/>
    <path d="M29 49 q7 6 14 0 M57 49 q7 6 14 0" {...line}/>
    <ellipse cx="50" cy="72" rx="5.5" ry="7" fill={ink}/>
    <text x="80" y="24" fontSize="15" fontWeight="700" fill={ink} fontFamily="Figtree,sans-serif">z</text><text x="89" y="13" fontSize="11" fontWeight="700" fill={ink} fontFamily="Figtree,sans-serif">z</text>
  </>,
};

const Face = ({ feeling, look }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="52" r="42" fill={look.skin}/>
    <path d="M10 44 C10 6 90 6 90 44 C74 24 26 24 10 44 Z" fill={look.hair}/>
    {PARTS[feeling]}
  </svg>
);

// Tricky level: a one-line story. "not" lists the wrong faces to offer, chosen so the right answer is never arguable.
const STORIES = [
  ["Sam", "Sam got a big hug from Grandma.", "happy", ["scared", "angry", "sleepy"]],
  ["Mia", "Mia's ice cream fell on the floor.", "sad", ["happy", "sleepy"]],
  ["Leo", "Someone took Leo's toy without asking.", "angry", ["happy", "sleepy"]],
  ["Ava", "Ava opened a box and a puppy jumped out!", "surprised", ["sad", "sleepy", "angry"]],
  ["Noah", "Noah heard a very loud thunder boom.", "scared", ["happy", "sleepy"]],
  ["Zoe", "Zoe played all day and now it is bedtime.", "sleepy", ["angry", "scared", "surprised"]],
  ["Lily", "Lily's friend shared a cookie with her.", "happy", ["sad", "angry", "scared"]],
  ["Kai", "Kai cannot find his teddy anywhere.", "sad", ["happy", "sleepy"]],
];
const SIMPLE = ["happy", "sad", "angry", "sleepy"];           // easiest faces to tell apart
const ALL = [...SIMPLE, "surprised", "scared"];

function faces(feelings, answer, look, n) {
  return shuffle(feelings).map((f, i) => ({ key: n + "-" + i, node: <Face feeling={f} look={look}/>, label: `${f} face`, correct: f === answer }));
}

function makeRounds(level) {
  if (level === "tricky") {
    return sample(STORIES, 6).map(([name, story, answer, not], n) => {
      const text = `${story} How does ${name} feel?`;
      return { prompt: <p className="g-prompt g-story">{story}<b>How does {name} feel?</b></p>, say: text, after: `Yes! ${name} feels ${answer}.`,
        choices: faces([answer, ...sample(not, 2)], answer, LOOKS[n % LOOKS.length], n) };
    });
  }
  const pool = level === "easy" ? SIMPLE : ALL, count = level === "easy" ? 2 : 3;
  let answers = [];
  while (answers.length < 6) answers = answers.concat(shuffle(pool));
  return answers.slice(0, 6).map((answer, n) => {
    const text = `Find the ${answer} face.`;
    return { prompt: <p className="g-prompt">Find the <b>{answer}</b> face.</p>, say: text, after: `Yes! That face is ${answer}.`,
      choices: faces([answer, ...sample(pool.filter(f => f !== answer), count - 1)], answer, pick(LOOKS), n) };
  });
}

export function FeelingsPlay({ level, report, done }) {
  const [rounds] = useState(() => makeRounds(level));
  return <Quiz rounds={rounds} report={report} done={done} cls="g-feel"/>;
}
