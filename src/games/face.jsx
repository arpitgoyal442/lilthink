// Make a Face: build a character from skin, hair, eyes, mouth and extras. There is no right answer.
// Practises creativity and imagination; the finish screen asks the child to tell the character's story.
import { sfx } from "./sound.js";
const { useState } = React;

const ink = "#33231C";
const line = { stroke: ink, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
const fringe = "M10 44 C10 6 90 6 90 44 C74 24 26 24 10 44 Z";

const SKIN = ["#F3D2B3", "#EDBE95", "#C98F68", "#8E5B3F", "#9CC7A8", "#B9ACE6"];
const HAIRC = ["#4A2F25", "#1F1512", "#D9A94A", "#D9603B", "#E58BB0", "#6FA8CF"];
// Each hair style can have a part behind the head and a part in front of it
const HAIR = [
  { name: "no hair" },
  { name: "short hair", front: c => <path d={fringe} fill={c}/> },
  { name: "spiky hair", front: c => <path d="M10 44 L15 14 L27 28 L35 4 L46 24 L56 2 L65 24 L77 6 L80 28 L91 16 L90 44 C74 26 26 26 10 44 Z" fill={c} stroke={c} strokeWidth="3" strokeLinejoin="round"/> },
  { name: "curly hair", front: c => <g fill={c}>{[[12,40],[19,23],[33,12],[50,8],[67,12],[81,23],[88,40]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="12"/>)}</g> },
  { name: "long hair", back: c => <path d="M5 52 C5 -2 95 -2 95 52 L98 104 L2 104 Z" fill={c}/>, front: c => <path d={fringe} fill={c}/> },
  { name: "pigtails", back: c => <g fill={c}><circle cx="3" cy="58" r="14"/><circle cx="97" cy="58" r="14"/></g>, front: c => <><path d={fringe} fill={c}/><circle cx="12" cy="46" r="4.5" fill="#E5836F"/><circle cx="88" cy="46" r="4.5" fill="#E5836F"/></> },
];
const EYES = [
  { name: "dot eyes", draw: <><circle cx="36" cy="48" r="4.5" fill={ink}/><circle cx="64" cy="48" r="4.5" fill={ink}/></> },
  { name: "big eyes", draw: <><circle cx="36" cy="47" r="8" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="37" cy="48" r="3.4" fill={ink}/><circle cx="64" cy="47" r="8" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx="65" cy="48" r="3.4" fill={ink}/></> },
  { name: "smiling eyes", draw: <path d="M29 50 q7 -9 14 0 M57 50 q7 -9 14 0" {...line}/> },
  { name: "sleepy eyes", draw: <path d="M29 47 q7 7 14 0 M57 47 q7 7 14 0" {...line}/> },
  { name: "winking eyes", draw: <><circle cx="36" cy="48" r="4.5" fill={ink}/><path d="M57 50 q7 -8 14 0" {...line}/></> },
];
const MOUTH = [
  { name: "smile", draw: <path d="M35 66 Q50 80 65 66" {...line}/> },
  { name: "big grin", draw: <path d="M32 63 Q50 85 68 63 Z" fill="#fff" stroke={ink} strokeWidth="3.5" strokeLinejoin="round"/> },
  { name: "tongue out", draw: <><path d="M34 65 Q50 77 66 65" {...line}/><path d="M45 70 v6 a5.5 5.5 0 0 0 11 0 v-6 Z" fill="#E5836F" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/></> },
  { name: "surprised mouth", draw: <ellipse cx="50" cy="72" rx="7" ry="8.5" fill={ink}/> },
  { name: "wobbly mouth", draw: <path d="M33 71 q4.25 -7 8.5 0 t8.5 0 t8.5 0 t8.5 0" {...line}/> },
  { name: "sad mouth", draw: <path d="M36 75 Q50 63 64 75" {...line}/> },
];
const EXTRA = [
  { name: "nothing extra" },
  { name: "crown", front: <path d="M24 18 L22 -8 L37 6 L50 -12 L63 6 L78 -8 L76 18 Z" fill="#D9A94A" stroke="#8A6118" strokeWidth="2.5" strokeLinejoin="round"/> },
  { name: "party hat", front: <><path d="M26 16 L50 -22 L74 16 Z" fill="#6FA8CF" stroke="#12352B" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="50" cy="-22" r="6" fill="#E5836F"/><circle cx="44" cy="4" r="3.5" fill="#F6E7BF"/><circle cx="57" cy="-3" r="3.5" fill="#F6E7BF"/></> },
  { name: "bow", front: <g fill="#E5836F" stroke="#12352B" strokeWidth="2.5" strokeLinejoin="round"><path d="M68 12 L50 2 L50 22 Z M68 12 L86 2 L86 22 Z"/><circle cx="68" cy="12" r="5"/></g> },
  { name: "glasses", front: <g fill="rgba(255,255,255,.35)" stroke="#12352B" strokeWidth="3.5"><circle cx="35" cy="48" r="12.5"/><circle cx="65" cy="48" r="12.5"/><path d="M47.5 48 h5 M22.5 46 L10 42 M77.5 46 L90 42" fill="none" strokeLinecap="round"/></g> },
  { name: "bunny ears", back: skin => <g fill={skin} stroke="rgba(51,35,28,.25)" strokeWidth="2"><ellipse cx="32" cy="2" rx="10" ry="24" transform="rotate(-12 32 2)"/><ellipse cx="68" cy="2" rx="10" ry="24" transform="rotate(12 68 2)"/><ellipse cx="32" cy="4" rx="4.5" ry="15" fill="#F2B8A2" stroke="none" transform="rotate(-12 32 4)"/><ellipse cx="68" cy="4" rx="4.5" ry="15" fill="#F2B8A2" stroke="none" transform="rotate(12 68 4)"/></g> },
];

export function Character({ c, label }) {
  const skin = SKIN[c.skin], hair = HAIR[c.hair], col = HAIRC[c.hairc], extra = EXTRA[c.extra];
  return (
    <svg viewBox="-14 -30 128 138" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {extra.back && extra.back(skin)}
      {hair.back && hair.back(col)}
      <circle cx="50" cy="52" r="42" fill={skin}/>
      <circle cx="24" cy="62" r="6" fill="#E5836F" opacity=".4"/><circle cx="76" cy="62" r="6" fill="#E5836F" opacity=".4"/>
      {hair.front && hair.front(col)}
      {EYES[c.eyes].draw}
      {MOUTH[c.mouth].draw}
      {extra.front}
    </svg>
  );
}

const rnd = (list) => Math.floor(Math.random() * list.length);
const random = () => ({ skin: rnd(SKIN), hair: 1 + rnd(HAIR.slice(1)), hairc: rnd(HAIRC), eyes: rnd(EYES), mouth: rnd(MOUTH), extra: rnd(EXTRA) });
// part: which piece of the character the tab changes. list: its choices.
const TABS = [["skin", "🎨", "Skin", SKIN], ["hair", "💇", "Hair", HAIR], ["eyes", "👀", "Eyes", EYES], ["mouth", "👄", "Mouth", MOUTH], ["extra", "👑", "Extras", EXTRA]];

export function FacePlay({ done }) {
  const [c, setC] = useState(random);
  const [tab, setTab] = useState("skin");
  const change = (part, i) => { sfx.tap(); setC({ ...c, [part]: i }); };
  const [part, , title, list] = TABS.find(t => t[0] === tab);

  return (
    <div className="g-face">
      <div className="g-me"><Character c={c} label="Your character"/></div>
      <div className="g-tabs" role="tablist" aria-label="What to change">
        {TABS.map(([id, icon, name]) => <button key={id} role="tab" aria-selected={tab === id} aria-label={name} className={tab === id ? "on" : ""} onClick={() => { sfx.tap(); setTab(id); }}><span aria-hidden="true">{icon}</span><em>{name}</em></button>)}
      </div>
      <div className="g-opts" role="group" aria-label={title}>
        {list.map((item, i) => (
          <button key={i} className={c[part] === i ? "on" : ""} aria-pressed={c[part] === i} aria-label={item.name || `colour ${i + 1}`} onClick={() => change(part, i)}>
            <Character c={{ ...c, [part]: i }}/>
          </button>))}
      </div>
      {tab === "hair" && c.hair > 0 &&
        <div className="g-dotsrow" role="group" aria-label="Hair colour">
          {HAIRC.map((h, i) => <button key={h} className={c.hairc === i ? "on" : ""} aria-pressed={c.hairc === i} aria-label={`hair colour ${i + 1}`} style={{ background: h }} onClick={() => change("hairc", i)}/>)}
        </div>}
      <div className="g-facebtns">
        <button className="btn o" onClick={() => { sfx.tap(); setC(random()); }}>🎲 Surprise me</button>
        <button className="btn" onClick={() => done(3, <Character c={c} label="The character you made"/>)}>I’m finished!</button>
      </div>
    </div>
  );
}
