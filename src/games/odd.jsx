// Odd One Out: tap the picture that does not belong. Practises attention and focus (and sorting into groups).
import { Quiz } from "./shell.jsx";
import { shuffle, sample, pick } from "./util.js";
const { useState } = React;

const SETS = {
  animals:  { all: "animals",            items: [["🐶","dog"],["🐱","cat"],["🐰","rabbit"],["🐻","bear"],["🐵","monkey"],["🐘","elephant"],["🦁","lion"],["🐷","pig"]] },
  fruit:    { all: "fruit",              items: [["🍎","apple"],["🍌","banana"],["🍇","grapes"],["🍓","strawberry"],["🍊","orange"],["🍉","watermelon"],["🍐","pear"],["🍒","cherries"]] },
  vehicles: { all: "things that go",     items: [["🚗","car"],["🚌","bus"],["🚲","bicycle"],["🚂","train"],["🚜","tractor"],["🚒","fire engine"]] },
  clothes:  { all: "clothes",            items: [["👕","t-shirt"],["👖","trousers"],["👗","dress"],["👟","shoe"],["🧦","socks"],["🧢","cap"]] },
  veg:      { all: "vegetables",         items: [["🥕","carrot"],["🌽","corn"],["🥦","broccoli"],["🥔","potato"],["🥒","cucumber"]] },
  sea:      { all: "sea animals",        items: [["🐟","fish"],["🐬","dolphin"],["🐙","octopus"],["🦀","crab"],["🐳","whale"]] },
  sky:      { all: "things that fly",    items: [["✈️","aeroplane"],["🚀","rocket"],["🚁","helicopter"],["🎈","balloon"]] },
  land:     { all: "land animals" },
  wheels:   { all: "things with wheels" },
};
SETS.land.items = SETS.animals.items;
SETS.wheels.items = SETS.vehicles.items;

const FAR = ["animals", "fruit", "vehicles", "clothes"];             // clearly different groups
const CLOSE = [["fruit", "veg"], ["veg", "fruit"], ["land", "sea"], ["sea", "land"], ["wheels", "sky"]]; // groups that take more thought

function makeRound(level, n) {
  let main, odd, after;
  if (level === "easy") { // three the same and one different: a pure "spot the difference"
    const [a, b] = sample(FAR, 2);
    const same = pick(SETS[a].items); odd = pick(SETS[b].items);
    main = [same, same, same];
    after = `Yes! The ${odd[1]} is different.`;
  } else {
    const [a, b] = level === "medium" ? sample(FAR, 2) : pick(CLOSE);
    main = sample(SETS[a].items, level === "medium" ? 3 : 5); odd = pick(SETS[b].items);
    after = `Yes! The ${odd[1]} is the odd one out. The others are all ${SETS[a].all}.`;
  }
  const choices = shuffle([...main.map(m => ({ item: m, correct: false })), { item: odd, correct: true }])
    .map((c, i) => ({ key: n + "-" + i, node: <span className="g-emo" aria-hidden="true">{c.item[0]}</span>, label: c.item[1], correct: c.correct }));
  return { prompt: <p className="g-prompt">Which one is different?</p>, choices, after };
}

export function OddPlay({ level, report, done }) {
  const [rounds] = useState(() => Array.from({ length: 6 }, (_, n) => makeRound(level, n)));
  return <Quiz rounds={rounds} report={report} done={done}/>;
}
