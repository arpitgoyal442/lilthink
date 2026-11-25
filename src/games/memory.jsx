// Match the Pairs: flip two cards at a time to find the matching pictures. Practises memory.
import { shuffle, sample } from "./util.js";
const { useState, useEffect, useRef } = React;

const PICTURES = [["🐶","dog"],["🐱","cat"],["🐸","frog"],["🐰","rabbit"],["🐻","bear"],["🐵","monkey"],["🐘","elephant"],["🐟","fish"],
  ["🍎","apple"],["🍌","banana"],["🍓","strawberry"],["🚗","car"],["🚂","train"],["⭐","star"],["🌈","rainbow"],["🌻","sunflower"],["⚽","ball"],["🎈","balloon"]];
const PAIRS = { easy: 3, medium: 4, tricky: 6 };

export function MemoryPlay({ level, report, done }) {
  const n = PAIRS[level];
  const [cards] = useState(() => shuffle(sample(PICTURES, n).flatMap(([e, name], id) => [{ id, e, name }, { id, e, name }])));
  const [open, setOpen] = useState([]);    // positions currently face up (not yet matched)
  const [found, setFound] = useState([]);  // ids of matched pairs
  const busy = useRef(false);
  const tries = useRef(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => { report(0, n); return () => timers.current.forEach(clearTimeout); }, []);

  const flip = (i) => {
    if (busy.current || open.includes(i) || found.includes(cards[i].id)) return;
    
    if (open.length === 0) { setOpen([i]); return; }
    const j = open[0];
    setOpen([j, i]); tries.current++; busy.current = true;
    if (cards[i].id === cards[j].id) {
      later(() => {
        
        const f = [...found, cards[i].id];
        setFound(f); setOpen([]); busy.current = false; report(f.length, n);
        // 3 stars for a nearly perfect memory, 2 for a good one, 1 for finishing
        if (f.length === n) later(() => done(tries.current <= n + 2 ? 3 : tries.current <= n * 2 + 1 ? 2 : 1), 1000);
      }, 500);
    } else {
      later(() => { setOpen([]); busy.current = false; }, 1100);
    }
  };

  return (
    <div className="g-mem">
      <p className="g-prompt">Find the two that match.</p>
      <div className={"g-cards n" + cards.length}>
        {cards.map((c, i) => {
          const isFound = found.includes(c.id), up = isFound || open.includes(i);
          return (
            <button key={i} className={"g-card" + (up ? " up" : "") + (isFound ? " hit" : "")} onClick={() => flip(i)}
              aria-label={up ? c.name + (isFound ? ", matched" : "") : `Card ${i + 1}, face down`}>
              <span className="g-in"><span className="g-cb" aria-hidden="true"/><span className="g-cf" aria-hidden="true">{up ? c.e : ""}</span></span>
            </button>);
        })}
      </div>
      <p className="g-fb" role="status">{found.length === n ? "You found them all!" : found.length ? `${found.length} of ${n} pairs found.` : " "}</p>
    </div>
  );
}
