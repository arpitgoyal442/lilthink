// First Sounds: listen and find the word, the matching first sound, or the rhyme. Practises language and communication.
// Every question is read aloud; the text on screen is there for the grown-up.
import { Quiz } from "./shell.jsx";
import { shuffle, sample, pick } from "./sound.js";
const { useState } = React;

// Words grouped by the sound they start with (each group shares its first letter too)
const STARTS = {
  b: [["⚽","ball"],["🍌","banana"],["🐻","bear"],["🚌","bus"],["🐝","bee"],["⛵","boat"],["📖","book"]],
  c: [["🐱","cat"],["🚗","car"],["🎂","cake"],["🐄","cow"],["🥕","carrot"]],
  d: [["🐶","dog"],["🦆","duck"],["🚪","door"],["🥁","drum"],["🐬","dolphin"]],
  f: [["🐟","fish"],["🐸","frog"],["🦊","fox"],["🔥","fire"],["🌸","flower"]],
  m: [["🌙","moon"],["🐵","monkey"],["🐭","mouse"],["🥛","milk"]],
  p: [["🐷","pig"],["🍐","pear"],["🍕","pizza"],["🐼","panda"],["🐧","penguin"]],
  s: [["☀️","sun"],["🧦","sock"],["🐌","snail"],["⭐","star"],["🥄","spoon"],["🐍","snake"]],
  t: [["🌳","tree"],["🚂","train"],["🐯","tiger"],["🐢","turtle"],["🍅","tomato"]],
  h: [["🎩","hat"],["🏠","house"],["🐴","horse"],["❤️","heart"]],
};
const WORDS = Object.values(STARTS).flat();
// Pairs that rhyme with each other and with nothing else in this list
const RHYMES = [[["🐱","cat"],["🎩","hat"]], [["🐶","dog"],["🐸","frog"]], [["🐝","bee"],["🌳","tree"]], [["⭐","star"],["🚗","car"]], [["🌙","moon"],["🥄","spoon"]],
  [["🐻","bear"],["🍐","pear"]], [["🧦","sock"],["⏰","clock"]], [["⛵","boat"],["🐐","goat"]], [["🐌","snail"],["🐳","whale"]], [["🏠","house"],["🐭","mouse"]],
  [["🦊","fox"],["📦","box"]], [["🎂","cake"],["🐍","snake"]], [["🦆","duck"],["🚚","truck"]]];

const cap = (w) => w[0].toUpperCase() + w.slice(1);
const tiles = (items, answer, n) => shuffle(items).map((it, i) => ({ key: n + "-" + i, label: it[1], correct: it === answer, node: <span className="g-emo" aria-hidden="true">{it[0]}</span> }));
const Target = ({ item, children }) => <div className="g-show"><span className="g-emo" role="img" aria-label={item[1]}>{item[0]}</span><p className="g-prompt">{children}</p></div>;

function makeRounds(level) {
  if (level === "easy") { // listen for a word and find its picture
    return sample(WORDS, 6).map((w, n) => ({
      prompt: <p className="g-prompt">Find the <b>{w[1]}</b>.</p>, say: `Find the ${w[1]}.`, after: `Yes! That is the ${w[1]}.`,
      choices: tiles([w, ...sample(WORDS.filter(x => x !== w), 2)], w, n) }));
  }
  if (level === "medium") { // which picture starts with the same sound?
    return sample(Object.keys(STARTS), 6).map((letter, n) => {
      const [target, match] = sample(STARTS[letter], 2);
      const others = sample(Object.keys(STARTS).filter(l => l !== letter), 2).map(l => pick(STARTS[l]));
      return { prompt: <Target item={target}>Which one starts like <b>{target[1]}</b>?</Target>, say: `${cap(target[1])}. Which one starts like ${target[1]}?`,
        after: `Yes! ${cap(target[1])} and ${match[1]} start with the same sound.`, choices: tiles([match, ...others], match, n) };
    });
  }
  return sample(RHYMES, 6).map((pair, n) => { // which picture rhymes?
    const [target, match] = shuffle(pair);
    const others = sample(RHYMES.filter(p => p !== pair), 2).map(p => pick(p));
    return { prompt: <Target item={target}>Which one rhymes with <b>{target[1]}</b>?</Target>, say: `${cap(target[1])}. Which one rhymes with ${target[1]}?`,
      after: `Yes! ${cap(target[1])} and ${match[1]} rhyme.`, choices: tiles([match, ...others], match, n) };
  });
}

export function SoundsPlay({ level, report, done }) {
  const [rounds] = useState(() => makeRounds(level));
  return <Quiz rounds={rounds} report={report} done={done} cls="g-sounds"/>;
}
