// Tiny Stories: two pictures tell a little story; what happens next? Practises logical thinking (cause and effect, order).
import { Quiz } from "./shell.jsx";
import { shuffle, sample } from "./util.js";
const { useState } = React;

// first picture, second picture, answer, the story in words, the sentence after a right answer, and a
// tempting-but-wrong picture used on Tricky. "hard" stories have a less obvious link and only appear on Tricky.
const STORIES = [
  { a: "🌰", b: "🌱", c: ["🌳", "tree"],      tell: "A seed goes into the ground. A little sprout pops up.", after: "Yes! The sprout grows into a tree.",            near: ["🍁", "leaf"] },
  { a: "🥚", b: "🐣", c: ["🐥", "chick"],     tell: "Here is an egg. The egg starts to crack.",              after: "Yes! A little chick comes out.",                near: ["🍳", "fried egg"] },
  { a: "🥚", b: "🐛", c: ["🦋", "butterfly"], tell: "A tiny egg on a leaf. Out comes a caterpillar.",        after: "Yes! The caterpillar turns into a butterfly.",  near: ["🐝", "bee"] },
  { a: "⛄", b: "☀️", c: ["💧", "water"],     tell: "Here is a snowman. The hot sun comes out.",             after: "Yes! The snowman melts into water.",            near: ["❄️", "snowflake"] },
  { a: "🎈", b: "📌", c: ["💥", "pop"],       tell: "Here is a balloon. Here comes a sharp pin.",            after: "Yes! The balloon goes pop!",                    near: ["🎁", "present"] },
  { a: "🌧️", b: "☀️", c: ["🌈", "rainbow"],   tell: "It is raining. Then the sun comes out.",                after: "Yes! A rainbow appears.",                       near: ["🌙", "moon"] },
  { a: "👶", b: "🧒", c: ["🧑", "grown-up"],  tell: "First a baby. Then a child.",                           after: "Yes! The child grows into a grown-up.",         near: ["🍼", "baby bottle"] },
  { a: "🌅", b: "☀️", c: ["🌙", "night"],     tell: "The sun comes up in the morning. It shines all day.",   after: "Yes! Then night comes, with the moon.",         near: ["🌈", "rainbow"] },
  { a: "🐔", b: "🥚", c: ["🐣", "hatching chick"], tell: "A hen sits on her nest. She lays an egg.",         after: "Yes! A chick hatches from the egg.",            near: ["🦆", "duck"] },
  { a: "🌱", b: "💧", c: ["🌻", "flower"],    tell: "Here is a little plant. It gets a drink of water.",     after: "Yes! The plant grows a flower.",                near: ["🍄", "mushroom"] },
  { a: "🐑", b: "🧶", c: ["🧦", "socks"],     tell: "A woolly sheep. Its wool is spun into yarn.",           after: "Yes! The yarn is knitted into socks.",          near: ["👟", "shoe"], hard: true },
  { a: "🐄", b: "🥛", c: ["🧀", "cheese"],    tell: "Here is a cow. The cow gives us milk.",                 after: "Yes! Milk is made into cheese.",                near: ["🥚", "egg"], hard: true },
  { a: "🐝", b: "🌸", c: ["🍯", "honey"],     tell: "A busy bee. It visits a flower.",                       after: "Yes! Bees make honey.",                         near: ["🍓", "strawberry"], hard: true },
  { a: "🌾", b: "🍞", c: ["🥪", "sandwich"],  tell: "Wheat grows in a field. It is baked into bread.",       after: "Yes! Bread is made into a sandwich.",           near: ["🍪", "cookie"], hard: true },
];
const OTHER = [["🚗", "car"], ["⚽", "ball"], ["🎸", "guitar"], ["🔑", "key"], ["👟", "shoe"], ["🚲", "bicycle"], ["🎩", "hat"], ["✂️", "scissors"]]; // clearly nothing to do with any story

function makeRound(level, n, s) {
  const others = sample(OTHER.filter(o => o[0] !== s.near[0]), 2);
  const wrong = level === "easy" ? [others[0]] : level === "medium" ? others : [s.near, others[0]];
  const choices = shuffle([[s.c, true], ...wrong.map(w => [w, false])])
    .map(([item, correct], i) => ({ key: n + "-" + i, label: item[1], correct, node: <span className="g-emo" aria-hidden="true">{item[0]}</span> }));
  const prompt = (solved) => (
    <div className="g-talewrap">
      <div className="g-tale" aria-hidden="true">
        <span>{s.a}</span><i>→</i><span>{s.b}</span><i>→</i><span className={"g-slot" + (solved ? " filled" : "")}>{solved ? s.c[0] : "?"}</span>
      </div>
      <p className="g-cap">{s.tell} <b>What happens next?</b></p>
    </div>);
  return { prompt, after: s.after, choices };
}

export function StoriesPlay({ level, report, done }) {
  const [rounds] = useState(() => sample(STORIES.filter(s => level === "tricky" || !s.hard), 6).map((s, n) => makeRound(level, n, s)));
  return <Quiz rounds={rounds} report={report} done={done} cls="g-stories"/>;
}
