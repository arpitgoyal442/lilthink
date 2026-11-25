import { Icon, star } from "./icons.jsx";
const { useState, useEffect, useRef } = React;

/* ───────── Subscription integration layer ─────────
   The browser only ever talks to YOUR backend endpoint. That endpoint (Express, Next API route,
   Cloudflare Worker…) should: re-validate the email, reject duplicates (unique index on lowercased email),
   store the consent record, send the welcome email through Resend and (optionally) call the n8n webhook,
   all with secrets kept in server env vars. See api/subscribe.js.
   Contract:  POST {email, consent:true, consentText, consentAt, source}
   Replies:   200 {status:"subscribed"} | 200 {status:"already_subscribed"} | 400 {error} | 5xx            */
const CONFIG = { endpoint: "/api/subscribe", mock: false /* true = fake success for design previews, nothing is sent */ };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONSENT_TEXT = "By subscribing, you agree to receive daily activity emails from Lil Think. You can unsubscribe anytime.";

async function subscribe(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Please enter a valid email address, like name@example.com." };
  if (CONFIG.mock) { // demo only – no data leaves the page
    await new Promise(r => setTimeout(r, 900));
    return { ok: true, status: "subscribed" };
  }
  try {
    const res = await fetch(CONFIG.endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: true, consentText: CONSENT_TEXT, consentAt: new Date().toISOString(), source: "landing" })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || "We couldn’t sign you up just now. Please try again in a moment." };
    return { ok: true, status: data.status || "subscribed" };
  } catch { return { ok: false, error: "We couldn’t reach Lil Think. Check your connection and try again." }; }
}

/* ───────── Content ───────── */
// [name, icon (see icons.jsx), description, card colour, abilities it works closely with]
const ABILITIES = [
 ["Memory","memory","Remembering objects, people, stories and past experiences.","y",[8,3]],
 ["Pattern Recognition","pattern","Recognising similarities, differences, sequences and patterns.","s",[4,6]],
 ["Attention & Focus","attention","Learning to notice details and stay engaged with an activity.","m",[8,10]],
 ["Language & Communication","language","Understanding words, expressing thoughts, asking questions and telling stories.","p",[0,7,11]],
 ["Logical Thinking","logic","Connecting ideas, recognising relationships and understanding simple cause and effect.","l",[1,6]],
 ["Spatial Reasoning","spatial","Understanding shapes, positions, directions and how objects fit together.","s",[6,1]],
 ["Problem-Solving","bulb","Trying different approaches when something doesn’t work.","y",[4,9,5]],
 ["Creativity & Imagination","palette","Inventing stories, imagining possibilities and finding new ways to use objects.","p",[3,9]],
 ["Working Memory","brain","Holding small pieces of information in mind while completing a task.","l",[0,2]],
 ["Cognitive Flexibility","flex","Adapting to new rules, trying different ideas and changing approaches.","m",[6,7,10]],
 ["Self-Regulation","sprout","Gradually learning to manage emotions, wait, pause and respond to situations.","s",[2,9,11]],
 ["Social Understanding","social","Recognising emotions, taking turns, cooperating and understanding other people’s perspectives.","y",[3,10]],
];
const PLAY = [["cup","Remembering where a toy was hidden."],["pattern","Recognising patterns in colours and shapes."],["blocks","Building a tower with blocks."],["book","Telling an imaginary story."],["spatial","Finding a different way to solve a puzzle."],["heart","Understanding how a friend might feel."]];
const STEPS = [["Subscribe","Enter your email address and join Lil Think for free.","y"],["Receive Your Daily Activity","Get a carefully organised activity in your inbox every day, with instructions, required materials, age guidance and the developmental ability it helps practise.","m"],["Play Together","Spend around 10–15 minutes playing with your child. You don’t need to be an expert. Just be present and enjoy the experience.","l"]];
// A sample week of emails: [short day, day, activity, ability, icon, you'll need, how to play, talk about it]
const WEEK = [
 ["Mon","Monday","The Hidden Toy Game","Memory","cup","a small toy and three cups.","Show your child the toy, hide it under one cup, then slide the cups around slowly. Ask, “Where did it go?” Take turns hiding it!","“What do you remember?”"],
 ["Tue","Tuesday","What Comes Next?","Pattern Recognition","pattern","socks, blocks or spoons in two colours.","Lay out a pattern: red, blue, red, blue. Ask, “What comes next?” Then let your child start a pattern for you to finish.","“How did you know?”"],
 ["Wed","Wednesday","Red Light, Green Light","Self-Regulation","traffic","nothing at all, just a little space to move.","Your child walks towards you when you say “green light” and freezes on “red light”. Then swap, and let them be the light.","“Was it hard to stop?”"],
 ["Thu","Thursday","Shadow Detectives","Spatial Reasoning","bulb","a torch, a spoon, a cup and a favourite toy.","Shine the torch so each object makes a shadow on the wall. Mix the objects up and ask, “Which shadow is which?”","“What makes the shadow bigger?”"],
 ["Fri","Friday","Mirror Faces","Social Understanding","smile","a mirror.","Make a happy, a sad and a surprised face in the mirror together, then take turns guessing each other’s.","“When did you feel like that?”"],
];
const FAQ = [
 ["What is Lil Think?","Lil Think is a free daily email for parents of children aged 2–5. Each one brings a single play-based activity with simple instructions, the materials you need, age guidance and the ability it helps your child practise."],
 ["What age are the activities for?","They are designed for toddlers and preschoolers aged 2 to 5. Every activity comes with age guidance so you can keep it right for your child."],
 ["How long does each activity take?","Around 10–15 minutes of playing together."],
 ["Do I need special toys or materials?","No. There is no complicated preparation and nothing expensive to buy. The sample Hidden Toy Game, for example, needs only a small toy and three cups."],
 ["Which skills do the activities help with?","Twelve early thinking and learning abilities: memory, pattern recognition, attention and focus, language and communication, logical thinking, spatial reasoning, problem-solving, creativity and imagination, working memory, cognitive flexibility, self-regulation and social understanding."],
 ["Is it free, and can I unsubscribe?","Subscribing is free. You can unsubscribe anytime by replying “unsubscribe” to any Lil Think email."],
];
const go = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
const calm = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────── Components ───────── */
const Logo = () => <a className="logo" href="#home" onClick={go("home")}><i aria-hidden="true"/>Lil Think</a>;

const Header = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = e => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);
  const nav = id => e => { setOpen(false); go(id)(e); };
  return (
    <header><div className="w"><nav className="top" aria-label="Main">
      <Logo/>
      <button className="burger" aria-expanded={open} aria-controls="menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(o => !o)}><span/><span/><span/></button>
      <div id="menu" className={"links" + (open ? " open" : "")}>
        <a href="#home" onClick={nav("home")}>Home</a>
        <a href="#why" onClick={nav("why")}>Why It Matters</a>
        <a href="#abilities" onClick={nav("abilities")}>What We Develop</a>
        <a href="#how" onClick={nav("how")}>How It Works</a>
        <a href="/games/">Play Zone</a>
        <a className="btn sm" href="#join" onClick={nav("join")}>Subscribe Free</a>
      </div>
    </nav></div></header>
  );
};

/* Illustration helpers. Anything that moves is wrapped in its own <g>, so the CSS animation never fights a position set on the shape. */
const SPARK = "M0-8C1-2 2-1 8 0 2 1 1 2 0 8-1 2-2 1-8 0-2-1-1-2 0-8z";
const Spark = ({ x, y, c = "#D9A94A", s = 1, d = 0 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><path className="spk" style={{ animationDelay: d + "s" }} d={SPARK} fill={c}/></g>;
const Sun = ({ x, y, r = 22 }) => (
  <g>
    <g className="rays">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x} ${y - r - 13}v7`} transform={`rotate(${i * 45} ${x} ${y})`} stroke="#F1CF7A" strokeWidth="3.5" strokeLinecap="round"/>)}</g>
    <circle className="pulse" cx={x} cy={y} r={r} fill="#F1CF7A"/>
  </g>
);
// Drifts gently; t places it, d is how many seconds one drift takes
const F = ({ t, d = 6, dl = 0, children }) => <g transform={t}><g className="flo" style={{ animationDuration: d + "s", animationDelay: -dl + "s" }}>{children}</g></g>;
const PUZZLE = "M13 17h4.2a5.5 5.5 0 1 1 7.6 0H29a4 4 0 0 1 4 4v4.2a5.5 5.5 0 1 1 0 7.6V37a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4v-4.2a5 5 0 1 0 0-7.6V21a4 4 0 0 1 4-4z";

const HeroArt = () => (
  <svg className="scene" viewBox="0 0 400 360" role="img" aria-label="A parent and child stacking colourful blocks together, with a puzzle piece and a book beside them" style={{display:"block",width:"100%",height:"auto"}}>
    <ellipse cx="200" cy="322" rx="170" ry="16" fill="#12352B" opacity=".1"/>
    <Sun x={60} y={52}/>
    <polygon className="tw" points={star(338, 80, 24, 11)} fill="#A99BDB"/>
    <Spark x={238} y={150} c="#E5836F" d={0.4}/><Spark x={92} y={214} c="#7FB3D5" s={0.8} d={1.6}/><Spark x={318} y={170} s={0.7} d={2.6}/>
    {/* parent */}
    <path d="M78 310c0-80 14-148 52-148s52 68 52 148z" fill="#1C4A3C"/>
    <g className="nod">
      <circle cx="130" cy="120" r="34" fill="#EDBE95"/><path d="M96 112c4-34 66-38 68 0-16-14-40-18-68 0z" fill="#4A2F25"/>
      <g className="blinks"><circle cx="121" cy="122" r="3" fill="#33231C"/><circle cx="140" cy="122" r="3" fill="#33231C"/></g>
      <path d="M122 133q8 7 17 0" stroke="#33231C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
    {/* child */}
    <path d="M232 310c0-54 10-92 40-92s40 38 40 92z" fill="#D9A94A"/>
    <g className="nod kid">
      <circle cx="272" cy="196" r="27" fill="#EDBE95"/><path d="M246 190c6-26 48-26 52 0-14-8-34-9-52 0z" fill="#33231C"/>
      <g className="blinks" style={{animationDelay:"-1.7s"}}><circle cx="263" cy="198" r="3" fill="#33231C"/><circle cx="282" cy="198" r="3" fill="#33231C"/></g>
      <path d="M265 208q8 6 16 0" stroke="#33231C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
    {/* the tower stacks itself, one block at a time */}
    <g className="blk b1"><rect x="170" y="268" width="46" height="42" rx="8" fill="#E5836F"/><text x="193" y="297" fontSize="22" fontWeight="700" fill="#fff" textAnchor="middle">A</text></g>
    <g className="blk b2"><rect x="174" y="228" width="40" height="40" rx="8" fill="#7FB3D5"/><text x="194" y="256" fontSize="20" fontWeight="700" fill="#fff" textAnchor="middle">B</text></g>
    <g className="blk b3"><rect x="178" y="192" width="34" height="36" rx="8" fill="#A99BDB"/><text x="195" y="217" fontSize="18" fontWeight="700" fill="#fff" textAnchor="middle">C</text></g>
    <g className="wig"><path d="M300 290h46v20h-46z" fill="#9CC7A8"/><circle cx="323" cy="286" r="8" fill="#9CC7A8"/></g>
    <rect x="46" y="284" width="64" height="26" rx="5" fill="#E8A07A"/><rect x="50" y="288" width="56" height="4" rx="2" fill="#fff" opacity=".7"/>
  </svg>
);

/* "We've already planned it": a week on the calendar ticking itself off, and today's activity arriving in an envelope */
const PlanArt = () => (
  <svg className="scene" viewBox="0 0 400 360" role="img" aria-label="A weekly calendar with each day ticked off, and an envelope with today’s activity card inside" style={{display:"block",width:"100%",height:"auto"}}>
    <ellipse cx="205" cy="326" rx="165" ry="14" fill="#12352B" opacity=".1"/>
    <Sun x={338} y={62} r={20}/>
    <polygon className="tw" points={star(52, 250, 20, 9)} fill="#A99BDB"/>
    <Spark x={262} y={52} c="#E5836F" d={0.8}/><Spark x={30} y={150} c="#7FB3D5" s={0.8} d={2}/><Spark x={376} y={200} s={0.7} d={3}/>
    {/* calendar */}
    <g transform="rotate(-6 130 120)">
      <rect x="34" y="50" width="196" height="140" rx="18" fill="#fff"/>
      <path d="M34 68a18 18 0 0 1 18-18h160a18 18 0 0 1 18 18v20H34z" fill="#E5836F"/>
      <rect x="74" y="40" width="8" height="24" rx="4" fill="#12352B"/><rect x="182" y="40" width="8" height="24" rx="4" fill="#12352B"/>
      <text x="132" y="77" fontSize="15" fontWeight="700" fill="#fff" textAnchor="middle">This week</text>
      {["M", "T", "W", "T", "F"].map((d, i) => (
        <g key={i}>
          <text x={60 + i * 36} y="116" fontSize="13" fontWeight="700" fill="#4A5F56" textAnchor="middle">{d}</text>
          <circle cx={60 + i * 36} cy="146" r="14" fill="#F3EDE0"/>
          <g className="tick" style={{ animationDelay: i * 0.55 + "s" }}>
            <circle cx={60 + i * 36} cy="146" r="14" fill={["#9CC7A8", "#7FB3D5", "#F1CF7A", "#A99BDB", "#F2B8A2"][i]}/>
            <path d={`M${53.5 + i * 36} 146.5l4.5 4.5 8.5-9.5`} stroke="#12352B" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </g>))}
    </g>
    {/* envelope with today's activity peeking out */}
    <rect x="158" y="196" width="204" height="118" rx="14" fill="#C9973A"/>
    <path d="M160 204L260 128l100 76z" fill="#D9A94A"/>
    <g className="rise">
      <rect x="188" y="136" width="144" height="150" rx="12" fill="#fff"/>
      <rect x="202" y="150" width="58" height="17" rx="8.5" fill="#E0DCF1"/><rect x="266" y="150" width="40" height="17" rx="8.5" fill="#D6E7DA"/>
      <rect x="202" y="178" width="96" height="8" rx="4" fill="#12352B"/>
      <rect x="202" y="196" width="114" height="6" rx="3" fill="#C9D3CD"/><rect x="202" y="209" width="88" height="6" rx="3" fill="#C9D3CD"/>
    </g>
    <path d="M158 204l102 64 102-64v96a14 14 0 0 1-14 14H172a14 14 0 0 1-14-14z" fill="#F1CF7A"/>
    <path d="M158 302l76-50M362 302l-76-50" stroke="#D9A94A" strokeWidth="3" strokeLinecap="round"/>
    <g className="hrt"><path d="M260 296c-9-6.5-13-10.5-13-15.5a6.6 6.6 0 0 1 13-2 6.6 6.6 0 0 1 13 2c0 5-4 9-13 15.5z" fill="#E5836F"/></g>
    <g className="wig"><rect x="70" y="270" width="44" height="42" rx="9" fill="#7FB3D5"/><polygon points={star(92, 291, 11)} fill="#fff"/></g>
  </svg>
);

/* Little clusters of shapes that fill the empty corners on wide screens. Decorative only. */
const DECO = {
  shapes: <svg viewBox="0 0 300 200">
    <F t="translate(40 30) rotate(-10)" d={7}><rect width="58" height="58" rx="13" fill="#E5836F"/><text x="29" y="41" fontSize="30" fontWeight="700" fill="#fff" textAnchor="middle">A</text></F>
    <F t="translate(150 14)" d={6} dl={2}><polygon points={star(30, 30, 30, 13)} fill="#A99BDB"/></F>
    <F t="translate(222 70)" d={8} dl={1}><circle cx="30" cy="30" r="23" fill="none" stroke="#D9A94A" strokeWidth="11"/></F>
    <F t="translate(118 96) rotate(12) scale(1.7)" d={7} dl={3}><path d={PUZZLE} fill="#9CC7A8"/></F>
    <F t="translate(20 140)" d={9} dl={4}><path d="M0 14c10-18 22-18 32 0s22 18 32 0" stroke="#7FB3D5" strokeWidth="7" fill="none" strokeLinecap="round"/></F>
    <Spark x={104} y={70} c="#D9A94A" d={1}/><Spark x={268} y={30} c="#E5836F" s={0.8} d={2.2}/>
  </svg>,
  kite: <svg viewBox="0 0 300 230">
    <F t="translate(8 30)" d={11}><path d="M22 44a15 15 0 0 1 3-29.6A20 20 0 0 1 63 10a15 15 0 0 1 8 34z" fill="#fff" opacity=".85"/></F>
    <F t="translate(206 150)" d={13} dl={5}><path d="M18 36a12 12 0 0 1 2.5-23.7A16 16 0 0 1 51 8a12 12 0 0 1 6.5 28z" fill="#fff" opacity=".7"/></F>
    <g className="sway">
      <path d="M176 152c-22 16 12 30-12 46s-42-6-66 14" stroke="#12352B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="170" cy="182" r="6" fill="#E5836F"/><circle cx="128" cy="204" r="6" fill="#D9A94A"/>
      <path d="M176 20v132M128 78h96" stroke="#12352B" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M176 20L128 78h48z" fill="#E5836F"/><path d="M176 20l48 58h-48z" fill="#F1CF7A"/><path d="M128 78l48 74V78z" fill="#7FB3D5"/><path d="M224 78l-48 74V78z" fill="#A99BDB"/>
    </g>
    <Spark x={262} y={40} c="#D9A94A" d={0.6}/><Spark x={86} y={120} c="#9CC7A8" s={0.8} d={2}/>
  </svg>,
  plane: <svg viewBox="0 0 320 180">
    <path className="dash" d="M8 150c44-58 96-8 136-46s48-56 92-62" stroke="#D9A94A" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="2 12"/>
    <F t="translate(232 12)" d={5}><path d="M72 4L0 30l24 11 7 27 13-18 20 9z" fill="#7FB3D5"/><path d="M72 4L24 41l7 27 13-18z" fill="#5F9CC4"/></F>
    <F t="translate(60 30)" d={8} dl={2}><path d="M20 34c-9-6.5-13-10.5-13-15.5a6.6 6.6 0 0 1 13-2 6.6 6.6 0 0 1 13 2c0 5-4 9-13 15.5z" fill="#E5836F"/></F>
    <Spark x={170} y={36} c="#A99BDB" d={1.2}/><Spark x={30} y={110} c="#9CC7A8" s={0.8} d={2.4}/>
  </svg>,
  askL: <svg viewBox="0 0 170 190">
    <F t="translate(20 20) rotate(-14 50 70)" d={7}><text x="50" y="118" fontSize="150" fontWeight="700" fontFamily="Fraunces,Georgia,serif" fill="#A99BDB" textAnchor="middle">?</text></F>
    <F t="translate(110 18)" d={6} dl={2}><polygon points={star(22, 22, 22, 10)} fill="#F1CF7A"/></F>
  </svg>,
  askR: <svg viewBox="0 0 170 190">
    <F t="translate(50 40) rotate(12 50 60)" d={8} dl={1}><text x="50" y="100" fontSize="120" fontWeight="700" fontFamily="Fraunces,Georgia,serif" fill="#E5836F" textAnchor="middle">?</text></F>
    <F t="translate(8 16)" d={7} dl={3}><circle cx="24" cy="24" r="17" fill="none" stroke="#7FB3D5" strokeWidth="9"/></F>
    <Spark x={150} y={24} c="#9CC7A8" d={1.4}/>
  </svg>,
  joinL: <svg viewBox="0 0 160 220">
    <F t="translate(20 118) rotate(-8)" d={7}><rect width="62" height="62" rx="14" fill="#7FB3D5"/><text x="31" y="44" fontSize="32" fontWeight="700" fill="#fff" textAnchor="middle">B</text></F>
    <F t="translate(64 50) rotate(10)" d={8} dl={2}><rect width="54" height="54" rx="12" fill="#E5836F"/><text x="27" y="38" fontSize="28" fontWeight="700" fill="#fff" textAnchor="middle">A</text></F>
    <Spark x={30} y={40} c="#D9A94A" d={0.8}/>
  </svg>,
  joinR: <svg viewBox="0 0 160 220">
    <F t="translate(40 20)" d={6} dl={1}><polygon points={star(40, 40, 38, 17)} fill="#F1CF7A"/></F>
    <F t="translate(14 116) scale(1.9)" d={8} dl={3}><path d="M20 34c-9-6.5-13-10.5-13-15.5a6.6 6.6 0 0 1 13-2 6.6 6.6 0 0 1 13 2c0 5-4 9-13 15.5z" fill="#E5836F"/></F>
    <F t="translate(96 120)" d={7} dl={2}><circle cx="22" cy="22" r="15" fill="none" stroke="#A99BDB" strokeWidth="9"/></F>
  </svg>,
};
const Deco = ({ k }) => <div className={"deco d-" + k} aria-hidden="true">{DECO[k]}</div>;

const Hero = () => (
  <section id="home" className="hero w">
    <div>
      <h1>Big Learning Starts With Little Play.</h1>
      <p className="lede">Your child’s early years are full of incredible possibilities. Help them explore, think, create and grow with a free daily activity for toddlers and preschoolers, sent straight to your inbox.</p>
      <div className="cta">
        <a className="btn" href="#join" onClick={go("join")}>Start Your Free Daily Activities</a>
        <a className="btn o" href="#abilities" onClick={go("abilities")}>Explore What Your Child Can Develop</a>
      </div>
      <p className="note">Designed for curious little minds aged 2–5.</p>
    </div>
    <div className="art"><HeroArt/></div>
  </section>
);

const Brain = () => (
  <svg className="brain" viewBox="0 0 320 280" role="img" aria-label="Illustration of a brain growing with sprouts of ideas" style={{width:"100%",maxWidth:400,height:"auto"}}>
    <circle cx="160" cy="140" r="124" fill="#D6E7DA"/>
    <g className="pulse"><path d="M160 70c-30-14-62 8-52 38-22 10-18 44 6 50-4 28 28 44 46 26 18 18 50 2 46-26 24-6 28-40 6-50 10-30-22-52-52-38z" fill="#F2B8A2" stroke="#12352B" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M160 74v108M130 112c14 4 20 14 30 14M190 112c-14 4-20 14-30 14M126 152c12-2 22 6 34 6" stroke="#12352B" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55"/></g>
    {[[100,60,"#D9A94A"],[224,56,"#A99BDB"],[250,150,"#7FB3D5"],[70,150,"#D9A94A"]].map(([x,y,c],i)=>(
      <g key={i} style={{transformOrigin:`${x}px ${y}px`,animation:`float ${4+i}s ease-in-out infinite`}}><circle cx={x} cy={y} r="11" fill={c}/><path d={`M${x} ${y-4}l2 5 5 .5-4 3 1.5 5-4.5-3-4.5 3 1.5-5-4-3 5-.5z`} fill="#fff"/></g>))}
    <Spark x={160} y={36} c="#E5836F" d={0.5}/><Spark x={268} y={96} c="#D9A94A" s={0.8} d={1.8}/><Spark x={48} y={104} c="#A99BDB" s={0.8} d={3}/>
  </svg>
);

const Why = () => (
  <section id="why" className="sec tint"><div className="w two">
    <div>
      <h2>Their Little Minds Are Learning More Than You Think.</h2>
      <p className="lede">Between the ages of 2 and 5, children are constantly discovering how the world works. Every question they ask, pattern they recognise, story they remember and problem they solve gives them an opportunity to practise important thinking and learning skills.</p>
      <p>Early childhood is an important period of development, and everyday play, conversation and exploration are wonderful, natural ways to practise these abilities.</p>
    </div>
    <div style={{display:"grid",placeItems:"center"}}><Brain/></div>
  </div></section>
);

const Abilities = () => {
  const [sel, setSel] = useState(null);
  const rel = sel === null ? [] : ABILITIES[sel][4];
  return (
    <section id="abilities" className="sec"><div className="w dw">
      <Deco k="shapes"/>
      <h2 style={{maxWidth:"16ch"}}>Twelve Ways a Little Mind Grows.</h2>
      <p className="lede">Intelligence isn’t just about remembering things or solving puzzles. Growing children use many different abilities to understand, explore and interact with the world around them.</p>
      <p className="note">These abilities overlap and support one another. Tap a card to see which ones often work together.</p>
      <div className={"grid" + (sel !== null ? " dim" : "")} role="list">
        {ABILITIES.map(([t, ic, d, c], i) => (
          <button key={t} role="listitem" aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}
            className={"ab" + (sel === i || rel.includes(i) ? " rel" : "")} style={{ background: `var(--${c})` }}>
            <span className="ic"><Icon name={ic}/></span>
            <span>
              <span className="t">{t}</span><span className="d">{d}</span>
              {sel === i && <span className="more">Works closely with: {rel.map(r => ABILITIES[r][0]).join(", ")}</span>}
            </span>
          </button>))}
      </div>
    </div></section>
  );
};

const Explore = () => (
  <section className="sec tint"><div className="w dw">
    <Deco k="kite"/>
    <h2 style={{maxWidth:"17ch"}}>Less Screen Time. More “Look What I Found!”</h2>
    <p className="lede">Children develop through everyday experiences. When we make time for conversations, imaginative play, movement, puzzles and exploration, we give them opportunities to practise important life skills.</p>
    <div className="play">{PLAY.map(([ic, t]) => <div className="pc" key={t}><b><Icon name={ic} size={30}/></b><span>{t}</span></div>)}</div>
  </div></section>
);

const Intro = () => (
  <section className="sec"><div className="w two">
    <div>
      <h2>What Should We Play Today? We’ve Already Planned It.</h2>
      <p className="lede">We understand that parenting is already a full-time responsibility.</p>
      <p>You want to support your child’s development, but finding the right activities every day, knowing what to do and keeping things age-appropriate can be overwhelming.</p>
      <p>That’s exactly why we created Lil Think. We’ve organised a simple daily activity plan designed around important developmental abilities. Every day, we’ll send you a fun activity directly to your email.</p>
      <p style={{color:"var(--ink)",fontWeight:600}}>No complicated preparation. No expensive toys. No hours spent searching the internet. Just simple, meaningful moments of play with your child.</p>
    </div>
    <div className="art alt" style={{animationDelay:"-3s"}}><PlanArt/></div>
  </div></section>
);

/* A sample week of emails. It moves on by itself while it is on screen (the little bar filling on the day is the timer),
   pauses under the pointer and stops for good once someone picks a day. */
const SampleWeek = () => {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.4 });
    io.observe(ref.current); return () => io.disconnect();
  }, []);
  return (
    <div className={"week" + (auto && seen ? " run" : "")} ref={ref}>
      <div className="days" role="group" aria-label="A sample week of activities">
        {WEEK.map(([d, day, title], n) => (
          <button key={d} type="button" className="day" aria-pressed={i === n} aria-label={`${day}: ${title}`}
            onClick={() => { setI(n); setAuto(false); }}
            onAnimationEnd={e => { if (e.animationName === "dayfill") setI((n + 1) % WEEK.length); }}>{d}</button>))}
      </div>
      <div className="mail">
        {WEEK.map(([d, day, title, ability, icon, need, how, talk], n) => (
          <div key={d} className={"mp" + (i === n ? " on" : "")} aria-hidden={i !== n}>
            <div className="mh"><span>From: <b>Lil Think</b><br/>Subject: <b>Today’s play: {title}</b></span><span className="mi"><Icon name={icon} size={30}/></span></div>
            <div className="mbd">
              <span className="tag">{ability}</span><span className="tag" style={{background:"var(--y)"}}>Ages 2–5</span><span className="tag" style={{background:"var(--m)"}}>10 min</span>
              <p style={{color:"var(--ink)"}}><b>You’ll need:</b> {need}</p>
              <p><b>How to play:</b> {how}</p>
              <p style={{margin:0}}><b>Talk about it:</b> {talk}</p>
            </div>
          </div>))}
      </div>
      <p className="note" style={{textAlign:"center",margin:"16px auto 0"}}>A sample week of what lands in your inbox.</p>
    </div>
  );
};

const How = () => (
  <section id="how" className="sec tint"><div className="w dw">
    <Deco k="plane"/>
    <h2>Here’s How It Works.</h2>
    <ol className="steps">
      {STEPS.map(([t, d, c], i) => <li key={t} className="st" style={{ background: `var(--${c})` }}><div className="n">{i + 1}</div><h3>{t}</h3><p>{d}</p></li>)}
    </ol>
    <SampleWeek/>
  </div></section>
);

const Reassure = () => (
  <section className="sec"><div className="w"><div className="warm">
    <h2>You Don’t Need to Be a Teacher to Be Their Favourite One.</h2>
    <p>You don’t need to be an early-childhood expert. You don’t need to buy expensive learning materials. And you don’t need to spend hours planning activities.</p>
    <p>We’ve already organised the plan. We’ll bring a fresh, practical activity to your inbox every day. All you need to do is spend a little time with your child, follow the simple instructions and enjoy learning together.</p>
    <p className="quote">Small moments. Meaningful memories. Beautiful discoveries.</p>
    <a className="btn gold" href="#join" onClick={go("join")}>Get My Free Daily Activities</a>
  </div></div></section>
);

const PlayZone = () => (
  <section id="play" className="sec tint"><div className="w two">
    <div>
      <h2>New: The Play Zone.</h2>
      <p className="lede">Twelve quick thinking games to play together, right in your browser: one for each of the 12 abilities. Each takes about two minutes and ends with an idea to try away from the screen.</p>
      <div className="cta"><a className="btn" href="/games/">Open the Play Zone</a></div>
      <p className="note">Free. No sign-up, no ads, nothing to download.</p>
    </div>
    <div className="pz" aria-hidden="true">
      {[["cards","Match the Pairs","y"],["traffic","Red Light, Green Light","m"],["bunny","Get Bunny Home","s"],["palette","Make a Face","p"]].map(([ic, t, c]) =>
        <div key={t} style={{ background: `var(--${c})` }}><b><Icon name={ic} size={46}/></b><span>{t}</span></div>)}
    </div>
  </div></section>
);

/* One question. Opens and closes with a short slide where the browser can do it; otherwise it is a plain <details>. */
const FaqItem = ({ q, a }) => {
  const ref = useRef(null), anim = useRef(null);
  const toggle = e => {
    const d = ref.current;
    if (!d || !d.animate || calm()) return; // the browser's own open/close
    e.preventDefault();
    const from = d.offsetHeight;
    anim.current?.cancel();
    const opening = !d.open || d.dataset.closing === "1";
    let to;
    if (opening) { delete d.dataset.closing; d.open = true; to = d.offsetHeight; }
    else { d.dataset.closing = "1"; to = e.currentTarget.offsetHeight + (d.offsetHeight - d.clientHeight); }
    d.style.overflow = "hidden";
    const run = anim.current = d.animate({ height: [from + "px", to + "px"] }, { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" });
    run.onfinish = () => { if (!opening) { d.open = false; delete d.dataset.closing; } d.style.overflow = ""; anim.current = null; };
  };
  return <details ref={ref}><summary onClick={toggle}>{q}</summary><p>{a}</p></details>;
};

const Faq = () => (
  <section id="faq" className="sec"><div className="w dw">
    <Deco k="askL"/><Deco k="askR"/>
    <h2 style={{textAlign:"center",margin:"0 auto"}}>Questions Parents Ask.</h2>
    <div className="faq">
      {FAQ.map(([q, a]) => <FaqItem key={q} q={q} a={a}/>)}
    </div>
  </div></section>
);

const CONFETTI = ["#E5836F", "#7FB3D5", "#A99BDB", "#9CC7A8", "#D9A94A", "#F1CF7A"];
const Confetti = () => {
  const [bits] = useState(() => Array.from({ length: 34 }, (_, i) => {
    const w = 7 + Math.random() * 6, round = i % 3 === 0;
    return { background: CONFETTI[i % CONFETTI.length], width: w, height: round ? w : w * 1.7, borderRadius: round ? "50%" : 2,
      "--x": (Math.random() * 2 - 1) * 250 + "px", "--u": -(50 + Math.random() * 130) + "px", "--r": Math.random() * 720 - 360 + "deg", animationDelay: Math.random() * 0.2 + "s" };
  }));
  return <div className="confetti" aria-hidden="true">{bits.map((s, i) => <i key={i} style={s}/>)}</div>;
};

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");
  const submit = async e => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading"); setMsg("");
    const r = await subscribe(email);
    if (r.ok) setState("success"); else { setState("error"); setMsg(r.error); }
  };
  if (state === "success") return (
    <div className="ok" role="status"><Confetti/><div className="big"><Icon name="party" size={84}/></div>
      <h2 style={{fontSize:"clamp(1.7rem,6vw,2.2rem)"}}>You’re In! Welcome to Lil Think.</h2>
      <p>Your little journey of discovery starts soon. Keep an eye on your inbox!</p></div>);
  return (
    <form onSubmit={submit} noValidate>
      <div className="f">
        <label htmlFor="email" className="sr">Email address</label>
        <input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" placeholder="Enter your email address"
          value={email} onChange={e => setEmail(e.target.value)} aria-invalid={state === "error"} aria-describedby="err"/>
        <button className="btn" disabled={state === "loading"}>{state === "loading" ? <><span className="sp" aria-hidden="true"/>Subscribing…</> : "Subscribe for Free"}</button>
      </div>
      <p id="err" className="err" role="alert">{msg}</p>
      <p className="fine">{CONSENT_TEXT}</p>
    </form>);
};

const Join = () => (
  <section id="join" className="sec tint"><div className="w dw">
    <Deco k="joinL"/><Deco k="joinR"/>
    <div className="signup">
      <h2>Ready for Tomorrow’s Little Adventure?</h2>
      <p>Join Lil Think and start receiving fun, play-based daily activities for your little one.</p>
      <SignupForm/>
    </div>
  </div></section>
);

const Footer = () => (
  <footer><div className="w fg">
    <div><Logo/><p style={{marginTop:10}}>Little Minds. Big Discoveries.</p><p className="fine">© {new Date().getFullYear()} Lil Think. All rights reserved.</p></div>
    <nav className="fl" aria-label="Footer">
      <div><a href="#home" onClick={go("home")}>Home</a><a href="#why" onClick={go("why")}>Why It Matters</a><a href="#abilities" onClick={go("abilities")}>What We Develop</a><a href="#how" onClick={go("how")}>How It Works</a><a href="/games/">Play Zone</a></div>
      <div><a href="#privacy" onClick={e => e.preventDefault()}>Privacy Policy</a><a href="mailto:hello@lilthink.com">Contact Us</a></div>
    </nav>
  </div></footer>
);

/* Mobile-only floating button: appears after the hero, hides once the signup section is on screen */
const StickyCta = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const vis = { home: true, join: false };
    const io = new IntersectionObserver(es => {
      es.forEach(e => { vis[e.target.id] = e.isIntersecting; });
      setShow(!vis.home && !vis.join);
    });
    ["home", "join"].forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return <a className={"sticky" + (show ? " on" : "")} href="#join" onClick={go("join")} tabIndex={show ? 0 : -1} aria-hidden={!show}>Get Free Daily Activities</a>;
};

/* Things below the fold rise into place as they scroll into view, a few at a time.
   Only what is still off screen when the page starts is hidden, so nothing visible ever flickers,
   and without JavaScript (or with reduced motion) everything is simply there. */
const REVEAL = ".sec h2,.sec .lede,.sec .note,.two>div>p,.ab,.pc,.st,.days,.mail,.warm,.pz>div,.faq details,.signup,.sec .art,.brain,.deco";
const useReveal = () => useEffect(() => {
  if (!("IntersectionObserver" in window) || calm()) return;
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, n) => {
      const el = e.target, wait = Math.min(n, 8) * 70;
      io.unobserve(el);
      el.style.transitionDelay = wait + "ms";
      el.dataset.rvs = "in";
      setTimeout(() => { delete el.dataset.rvs; el.style.transitionDelay = ""; }, wait + 1500); // hand hover effects back
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
  document.querySelectorAll(REVEAL).forEach(el => {
    if (el.parentElement.closest(REVEAL)) return; // its parent already brings it in
    if (el.getBoundingClientRect().top > innerHeight * 0.94) { el.dataset.rvs = "out"; io.observe(el); }
  });
  return () => io.disconnect();
}, []);

const App = () => { useReveal(); return <><Header/><main><Hero/><Why/><Abilities/><Explore/><Intro/><How/><Reassure/><PlayZone/><Faq/><Join/></main><Footer/><StickyCta/></>; };

export default App;
