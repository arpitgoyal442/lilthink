// Get Bunny Home: plan a path around the trees. Practises problem-solving (trying a way, hitting a wall, trying another).
const { useState, useEffect, useRef } = React;

// n: grid size. trees: how many cells are blocked. min: the shortest way home must be at least this many hops.
// detour: the straight way must be blocked, so the child has to go around.
const PLAN = {
  easy:   { n: 4, trees: 3, min: 4 },
  medium: { n: 5, trees: 6, min: 6 },
  tricky: { n: 5, trees: 9, min: 8, detour: true },
};
const MAZES = 3;

// Shortest number of hops from start to goal, or -1 if the trees block every way
function hops(n, trees, start, goal) {
  const seen = new Set([start]); let edge = [start], d = 0;
  while (edge.length) {
    if (edge.includes(goal)) return d;
    const next = [];
    for (const c of edge) {
      const x = c % n, y = (c - x) / n;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * n + nx;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n || trees.has(k) || seen.has(k)) continue;
        seen.add(k); next.push(k);
      }
    }
    edge = next; d++;
  }
  return -1;
}

// Makes random mazes until one fits the plan; every maze handed back can be solved.
function makeMaze(plan) {
  const { n } = plan; let best = null;
  for (let t = 0; t < 3000; t++) {
    const cells = Array.from({ length: n * n }, (_, i) => i).sort(() => Math.random() - 0.5);
    const [start, goal] = cells, trees = new Set(cells.slice(2, 2 + plan.trees));
    const d = hops(n, trees, start, goal);
    if (d < 1) continue;
    const straight = Math.abs(start % n - goal % n) + Math.abs(Math.floor(start / n) - Math.floor(goal / n));
    const maze = { n, start, goal, trees, d };
    if (d >= plan.min && (!plan.detour || d > straight)) return maze;
    if (!best || d > best.d) best = maze;
  }
  return best;
}

export function BunnyPlay({ level, report, done }) {
  const plan = PLAN[level];
  const [mazes] = useState(() => Array.from({ length: MAZES }, () => makeMaze(plan)));
  const [m, setM] = useState(0);
  const [at, setAt] = useState(mazes[0].start);
  const [bump, setBump] = useState(0);
  const [won, setWon] = useState(false);
  const moves = useRef(0), timer = useRef(null), live = useRef(null);
  const maze = mazes[m], n = maze.n;

  const move = (dx, dy) => {
    if (won) return;
    const x = at % n + dx, y = Math.floor(at / n) + dy, k = y * n + x;
    if (x < 0 || y < 0 || x >= n || y >= n || maze.trees.has(k)) { setBump(b => b + 1); return; } // a tree or the edge: try another way
    moves.current++; setAt(k);
    if (k !== maze.goal) { return; }
    setWon(true); report(m + 1, MAZES);
    timer.current = setTimeout(() => {
      if (m + 1 < MAZES) { setM(m + 1); setAt(mazes[m + 1].start); setWon(false); setBump(0); return; }
      const best = mazes.reduce((sum, z) => sum + z.d, 0);
      done(moves.current <= best + 3 ? 3 : moves.current <= best * 1.8 + 3 ? 2 : 1);
    }, 1400);
  };
  live.current = move; // the keyboard listener below always calls the newest version

  useEffect(() => {
    report(0, MAZES);
    const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const onKey = (e) => { if (keys[e.key]) { e.preventDefault(); live.current(...keys[e.key]); } };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer.current); };
  }, []);

  // Tapping the square next to Bunny also moves there
  const tapCell = (k) => { const dx = k % n - at % n, dy = Math.floor(k / n) - Math.floor(at / n); if (Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy); };

  return (
    <div className="g-bunny">
      <p className="g-prompt" role="status">{won ? "Bunny is home!" : "Help Bunny hop home."}</p>
      <div className={"g-maze n" + n} style={{ "--n": n }} role="img" aria-label={`A ${n} by ${n} garden with trees. Bunny needs to reach the house.`}>
        {Array.from({ length: n * n }, (_, k) => (
          <span key={m + "-" + k} className={"g-cell" + (maze.trees.has(k) ? " tree" : "")} onClick={() => tapCell(k)}>
            {maze.trees.has(k) ? "🌳" : k === at ? <b key={bump} className={bump ? "wob" : "hop"}>🐰</b> : k === maze.goal ? "🏠" : ""}
          </span>))}
      </div>
      <div className="g-arrows">
        <button className="up" aria-label="Up" onClick={() => move(0, -1)}>↑</button>
        <button className="left" aria-label="Left" onClick={() => move(-1, 0)}>←</button>
        <button className="down" aria-label="Down" onClick={() => move(0, 1)}>↓</button>
        <button className="right" aria-label="Right" onClick={() => move(1, 0)}>→</button>
      </div>
    </div>
  );
}
