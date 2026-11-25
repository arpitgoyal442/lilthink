// The frame every game sits in: start screen (pick a level), the game itself, and the finish screen.
import { saveStars, saveLevel, pick } from "./util.js";
import { Icon } from "../icons.jsx";
const { useState, useEffect, useRef } = React;

export const LEVELS = [["easy", "Easy", "Ages 2–3"], ["medium", "Medium", "Ages 3–4"], ["tricky", "Tricky", "Ages 4–5"]];

export const Stars = ({ n, of = 3, label }) => (
  <span className="g-stars" role="img" aria-label={label || `${n} of ${of} stars`}>
    {Array.from({ length: of }, (_, i) => <span key={i} className={i < n ? "on" : ""} aria-hidden="true">★</span>)}
  </span>
);

export const GHeader = ({ hub }) => (
  <header><div className="w"><nav className="g-nav" aria-label="Main">
    <a className="logo" href="/"><i aria-hidden="true"/>Lil Think</a>
    {hub ? <a className="btn sm" href="/#join">Subscribe Free</a> : <a className="g-back" href="/games/">← All games</a>}
  </nav></div></header>
);

export const GFooter = () => (
  <footer><div className="w fg">
    <div><a className="logo" href="/"><i aria-hidden="true"/>Lil Think</a><p style={{marginTop:10}}>Little Minds. Big Discoveries.</p><p className="fine">Games run in your browser. Nothing your child does here is collected or sent anywhere.</p></div>
    <nav className="fl" aria-label="Footer">
      <div><a href="/">Home</a><a href="/games/">Play Zone</a><a href="/#join">Daily activities by email</a></div>
      <div><a href="mailto:hello@lilthink.com">Contact Us</a></div>
    </nav>
  </div></footer>
);

// 3 stars for (almost) all right first time, 2 for at least half, 1 for finishing: every child gets a star.
export const starsFor = (firstTry, total) => (firstTry >= total - 1 ? 3 : firstTry >= total / 2 ? 2 : 1);

export function GameShell({ game, Play }) {
  const [phase, setPhase] = useState("start"); // start | play | done
  const [level, setLevel] = useState("easy");
  const [run, setRun] = useState(0);
  const [prog, setProg] = useState([0, 0]);
  const [stars, setStars] = useState(0);
  const [tip, setTip] = useState(game.tips[0]);
  const [keepsake, setKeepsake] = useState(null); // something the child made, shown again on the finish screen
  const head = useRef(null);
  const first = useRef(true);

  // Move keyboard and screen-reader focus to the new screen's heading
  useEffect(() => { if (first.current) { first.current = false; return; } head.current && head.current.focus(); }, [phase, run]);

  const start = (l) => { setLevel(l); saveLevel(l); setProg([0, 0]); setRun(r => r + 1); setPhase("play"); };
  const done = (s, made = null) => { setStars(s); setKeepsake(made); saveStars(game.id, s); setTip(pick(game.tips)); setPhase("done"); };
  const report = (n, total) => setProg([n, total]);
  const next = LEVELS[LEVELS.findIndex(l => l[0] === level) + 1];

  return (
    <div className={"g-stage g-" + game.id}>
      <div className="g-bar">
        <span className="g-tag" style={{ background: `var(--${game.tint})` }}>{game.ability}</span>
        {phase === "play" && prog[1] > 0 &&
          <span className={"g-dots" + (prog[1] > 7 ? " many" : "")} role="img" aria-label={`${prog[0]} of ${prog[1]} done`}>
            {Array.from({ length: prog[1] }, (_, i) => <i key={i} className={i < prog[0] ? "on" : ""}/>)}
          </span>}
      </div>

      {phase === "start" &&
        <div className="g-start">
          <div className="g-big"><Icon name={game.icon} size={72}/></div>
          <h1 ref={head} tabIndex={-1}>{game.title}</h1>
          <p className="g-how">{game.how}</p>
          {game.free
            ? <button className="btn g-startbtn" onClick={() => start("easy")}>Start</button>
            : <>
              <p className="g-pick" id="pick">Choose a level to start:</p>
              <div className="g-levels" role="group" aria-labelledby="pick">
                {LEVELS.map(([id, name, ages]) => <button key={id} className="g-level" onClick={() => start(id)}><b>{name}</b><span>{ages}</span></button>)}
              </div>
            </>}
        </div>}

      {phase === "play" &&
        <div className="g-play">
          <h1 className="sr" ref={head} tabIndex={-1}>{game.title}: {LEVELS.find(l => l[0] === level)[1]}</h1>
          <Play key={run} level={level} report={report} done={done}/>
        </div>}

      {phase === "done" &&
        <div className="g-done">
          {keepsake && <div className="g-keep">{keepsake}</div>}
          <Stars n={stars}/>
          <h1 ref={head} tabIndex={-1}>{stars === 3 ? "Wonderful!" : stars === 2 ? "Well done!" : "You did it!"}</h1>
          <div className="g-tip"><b>Now try it away from the screen</b><p>{tip}</p></div>
          <div className="g-again">
            <button className="btn" onClick={() => start(level)}>{game.again || "Play again"}</button>
            {next && !game.free && <button className="btn o" onClick={() => start(next[0])}>Try {next[1]}</button>}
            <a className="btn o" href="/games/">All games</a>
          </div>
          <p className="g-parent">Parents: <a href="/#join">get a new play idea by email every day, free</a>.</p>
        </div>}
    </div>
  );
}

// A round-by-round "tap the right one" game. Each round: { prompt, choices: [{ key, node, label, correct }], after? }.
// A wrong tap wobbles and lets the child try again; there is no timer and nothing is taken away.
export function Quiz({ rounds, report, done, cls = "" }) {
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);
  const firstTry = useRef(0);
  const timer = useRef(null);
  const r = rounds[i];

  useEffect(() => { report(i + (solved ? 1 : 0), rounds.length); }, [i, solved]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tap = (c) => {
    if (solved || wrong.includes(c.key)) return;
    if (!c.correct) { setWrong(w => [...w, c.key]); return; }
    
    if (!wrong.length) firstTry.current++;
    setSolved(true);
    timer.current = setTimeout(() => {
      if (i + 1 < rounds.length) { setI(i + 1); setWrong([]); setSolved(false); }
      else done(starsFor(firstTry.current, rounds.length));
    }, r.after ? Math.min(4500, 1300 + r.after.length * 45) : 1200); // long enough to read the sentence
  };

  return (
    <div className={"g-quiz " + cls}>
      <div className="g-q">
        {typeof r.prompt === "function" ? r.prompt(solved) : r.prompt}
      </div>
      <div className={"g-ch g-c" + r.choices.length}>
        {r.choices.map(c => (
          <button key={c.key} aria-label={c.label} aria-disabled={wrong.includes(c.key)}
            className={"g-tile" + (solved && c.correct ? " yes" : "") + (wrong.includes(c.key) ? " no" : "") + (solved && !c.correct ? " dim" : "")}
            onClick={() => tap(c)}>{c.node}</button>))}
      </div>
      <p className="g-fb" role="status">{solved ? (r.after || "Yes! Well done.") : wrong.length ? "Not that one. Try again!" : " "}</p>
    </div>
  );
}
