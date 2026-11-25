// Red Light, Green Light: tap to walk on green, and hold back on red. Practises self-regulation (waiting and stopping).
import { sfx, say } from "./sound.js";
const { useState, useEffect, useRef } = React;

// steps: taps needed to get home. green/red: how long each light lasts (random between the two numbers, in ms).
const PLAN = {
  easy:   { steps: 8,  green: [3200, 4400], red: [1800, 2600] },
  medium: { steps: 10, green: [2200, 3400], red: [2000, 3000] },
  tricky: { steps: 12, green: [1400, 2600], red: [2000, 3400], yellow: true }, // yellow also means wait
};
const between = ([a, b]) => a + Math.random() * (b - a);
const GRACE = 450; // a tap just after the light turns red is forgiven: little hands are not that fast

export function RedLightPlay({ level, report, done }) {
  const plan = PLAN[level];
  const [light, setLight] = useState("red");
  const [steps, setSteps] = useState(0);
  const [oops, setOops] = useState(0);    // used to replay the wobble
  const [home, setHome] = useState(false);
  const mistakes = useRef(0), changed = useRef(0), timer = useRef(null), now = useRef("red");

  const turn = (to) => {
    now.current = to; changed.current = Date.now(); setLight(to);
    if (to === "green") { sfx.note(4); say("Go!"); timer.current = setTimeout(() => turn("red"), between(plan.green)); }
    else if (to === "red") { sfx.note(0); say("Stop!"); timer.current = setTimeout(() => turn(plan.yellow ? "yellow" : "green"), between(plan.red)); }
    else { sfx.note(2); timer.current = setTimeout(() => turn("green"), 1100); }
  };
  // No progress dots here: the turtle on the path already shows how far there is to go.
  useEffect(() => { timer.current = setTimeout(() => turn("green"), 1600); return () => clearTimeout(timer.current); }, []);

  const tap = () => {
    if (home) return;
    if (now.current === "green") {
      const s = steps + 1;
      sfx.tap(); setSteps(s);
      if (s === plan.steps) {
        clearTimeout(timer.current); setHome(true); sfx.good();
        timer.current = setTimeout(() => done(mistakes.current <= 1 ? 3 : mistakes.current <= 4 ? 2 : 1), 1500);
      }
      return;
    }
    if (now.current === "red" && Date.now() - changed.current < GRACE) return;
    mistakes.current++; sfx.bad(); setOops(o => o + 1);
    setSteps(Math.max(0, steps - 1)); // one small step back, nothing more
  };

  const message = home ? "Turtle is home! Great waiting." : light === "green" ? "Green means go! Tap to walk." : light === "yellow" ? "Yellow means wait..." : "Red means stop. Wait...";
  return (
    <div className="g-rl">
      <div className="g-lamp" role="img" aria-label={`The light is ${light}`}>
        <i className={"r" + (light === "red" ? " on" : "")}/>{plan.yellow && <i className={"y" + (light === "yellow" ? " on" : "")}/>}<i className={"gr" + (light === "green" ? " on" : "")}/>
      </div>
      <p className="g-prompt" role="status">{message}</p>
      <div className="g-track" role="img" aria-label={`Turtle has taken ${steps} of ${plan.steps} steps`}>
        <span className="g-home">🏠</span>
        <span className="g-walker" key={oops} style={{ left: `calc((100% - 3.4rem) * ${steps / plan.steps})` }}><b className={oops ? "wob" : ""}>🐢</b></span>
      </div>
      <button className={"g-step " + light} onClick={tap} aria-label="Take a step">{light === "green" ? "Go!" : "Wait"}</button>
    </div>
  );
}
