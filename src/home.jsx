const { useState, useEffect } = React;

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
const ABILITIES = [
 ["Memory","🧸","Remembering objects, people, stories and past experiences.","y",[8,3]],
 ["Pattern Recognition","🔷","Recognising similarities, differences, sequences and patterns.","s",[4,6]],
 ["Attention & Focus","🔍","Learning to notice details and stay engaged with an activity.","m",[8,10]],
 ["Language & Communication","💬","Understanding words, expressing thoughts, asking questions and telling stories.","p",[0,7,11]],
 ["Logical Thinking","🔗","Connecting ideas, recognising relationships and understanding simple cause and effect.","l",[1,6]],
 ["Spatial Reasoning","🧩","Understanding shapes, positions, directions and how objects fit together.","s",[6,1]],
 ["Problem-Solving","💡","Trying different approaches when something doesn’t work.","y",[4,9,5]],
 ["Creativity & Imagination","🎨","Inventing stories, imagining possibilities and finding new ways to use objects.","p",[3,9]],
 ["Working Memory","🧠","Holding small pieces of information in mind while completing a task.","l",[0,2]],
 ["Cognitive Flexibility","🔄","Adapting to new rules, trying different ideas and changing approaches.","m",[6,7,10]],
 ["Self-Regulation","🌱","Gradually learning to manage emotions, wait, pause and respond to situations.","s",[2,9,11]],
 ["Social Understanding","🤝","Recognising emotions, taking turns, cooperating and understanding other people’s perspectives.","y",[3,10]],
];
const PLAY = [["🪀","Remembering where a toy was hidden."],["🎨","Recognising patterns in colours and shapes."],["🧱","Building a tower with blocks."],["📖","Telling an imaginary story."],["🧩","Finding a different way to solve a puzzle."],["🫶","Understanding how a friend might feel."]];
const STEPS = [["Subscribe","Enter your email address and join Lil Think for free.","y"],["Receive Your Daily Activity","Get a carefully organised activity in your inbox every day, with instructions, required materials, age guidance and the developmental ability it helps practise.","m"],["Play Together","Spend around 10–15 minutes playing with your child. You don’t need to be an expert. Just be present and enjoy the experience.","l"]];
const FAQ = [
 ["What is Lil Think?","Lil Think is a free daily email for parents of children aged 2–5. Each one brings a single play-based activity with simple instructions, the materials you need, age guidance and the ability it helps your child practise."],
 ["What age are the activities for?","They are designed for toddlers and preschoolers aged 2 to 5. Every activity comes with age guidance so you can keep it right for your child."],
 ["How long does each activity take?","Around 10–15 minutes of playing together."],
 ["Do I need special toys or materials?","No. There is no complicated preparation and nothing expensive to buy. The sample Hidden Toy Game, for example, needs only a small toy and three cups."],
 ["Which skills do the activities help with?","Twelve early thinking and learning abilities: memory, pattern recognition, attention and focus, language and communication, logical thinking, spatial reasoning, problem-solving, creativity and imagination, working memory, cognitive flexibility, self-regulation and social understanding."],
 ["Is it free, and can I unsubscribe?","Subscribing is free. You can unsubscribe anytime by replying “unsubscribe” to any Lil Think email."],
];
const go = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

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

const HeroArt = () => (
  <svg viewBox="0 0 400 360" role="img" aria-label="A parent and child playing with colourful blocks, a puzzle and a book" style={{display:"block",width:"100%",height:"auto"}}>
    <ellipse cx="200" cy="322" rx="170" ry="16" fill="#12352B" opacity=".1"/>
    <circle cx="130" cy="120" r="34" fill="#EDBE95"/><path d="M96 112c4-34 66-38 68 0-16-14-40-18-68 0z" fill="#4A2F25"/>
    <path d="M78 310c0-80 14-148 52-148s52 68 52 148z" fill="#1C4A3C"/>
    <circle cx="272" cy="196" r="27" fill="#EDBE95"/><path d="M246 190c6-26 48-26 52 0-14-8-34-9-52 0z" fill="#33231C"/>
    <path d="M232 310c0-54 10-92 40-92s40 38 40 92z" fill="#D9A94A"/>
    <circle cx="263" cy="198" r="3" fill="#33231C"/><circle cx="282" cy="198" r="3" fill="#33231C"/><path d="M265 208q8 6 16 0" stroke="#33231C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="121" cy="122" r="3" fill="#33231C"/><circle cx="140" cy="122" r="3" fill="#33231C"/><path d="M122 133q8 7 17 0" stroke="#33231C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <rect x="170" y="268" width="46" height="42" rx="8" fill="#E5836F"/><rect x="176" y="228" width="40" height="40" rx="8" fill="#7FB3D5"/><rect x="182" y="192" width="34" height="36" rx="8" fill="#A99BDB"/>
    <text x="193" y="296" fontSize="22" fontWeight="700" fill="#fff" textAnchor="middle">A</text><text x="196" y="256" fontSize="20" fontWeight="700" fill="#fff" textAnchor="middle">B</text>
    <path d="M300 290h46v20h-46z" fill="#9CC7A8"/><circle cx="323" cy="286" r="8" fill="#9CC7A8"/>
    <rect x="46" y="284" width="64" height="26" rx="5" fill="#E8A07A"/><rect x="50" y="288" width="56" height="4" rx="2" fill="#fff" opacity=".7"/>
    <circle cx="60" cy="50" r="22" fill="#F1CF7A"/><path d="M340 60l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z" fill="#A99BDB"/>
  </svg>
);

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
  <svg viewBox="0 0 320 280" role="img" aria-label="Illustration of a brain growing with sprouts of ideas" style={{width:"100%",maxWidth:400,height:"auto"}}>
    <circle cx="160" cy="140" r="124" fill="#D6E7DA"/>
    <path d="M160 70c-30-14-62 8-52 38-22 10-18 44 6 50-4 28 28 44 46 26 18 18 50 2 46-26 24-6 28-40 6-50 10-30-22-52-52-38z" fill="#F2B8A2" stroke="#12352B" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M160 74v108M130 112c14 4 20 14 30 14M190 112c-14 4-20 14-30 14M126 152c12-2 22 6 34 6" stroke="#12352B" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55"/>
    {[[100,60,"#D9A94A"],[224,56,"#A99BDB"],[250,150,"#7FB3D5"],[70,150,"#D9A94A"]].map(([x,y,c],i)=>(
      <g key={i} style={{transformOrigin:`${x}px ${y}px`,animation:`float ${4+i}s ease-in-out infinite`}}><circle cx={x} cy={y} r="11" fill={c}/><path d={`M${x} ${y-4}l2 5 5 .5-4 3 1.5 5-4.5-3-4.5 3 1.5-5-4-3 5-.5z`} fill="#fff"/></g>))}
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
    <section id="abilities" className="sec"><div className="w">
      <h2 style={{maxWidth:"20ch"}}>12 Little Abilities. A World of Possibilities.</h2>
      <p className="lede">Intelligence isn’t just about remembering things or solving puzzles. Growing children use many different abilities to understand, explore and interact with the world around them.</p>
      <p className="note">These abilities overlap and support one another. Tap a card to see which ones often work together.</p>
      <div className={"grid" + (sel !== null ? " dim" : "")} role="list">
        {ABILITIES.map(([t, ic, d, c], i) => (
          <button key={t} role="listitem" aria-pressed={sel === i} onClick={() => setSel(sel === i ? null : i)}
            className={"ab" + (sel === i || rel.includes(i) ? " rel" : "")} style={{ background: `var(--${c})` }}>
            <span className="ic" aria-hidden="true">{ic}</span>
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
  <section className="sec tint"><div className="w">
    <h2 style={{maxWidth:"22ch"}}>Children Don’t Need More Screens. They Need More Opportunities to Explore.</h2>
    <p className="lede">Children develop through everyday experiences. When we make time for conversations, imaginative play, movement, puzzles and exploration, we give them opportunities to practise important life skills.</p>
    <div className="play">{PLAY.map(([e, t]) => <div className="pc" key={t}><b aria-hidden="true">{e}</b><span>{t}</span></div>)}</div>
  </div></section>
);

const Intro = () => (
  <section className="sec"><div className="w two">
    <div>
      <h2>You Don’t Have to Figure It All Out. We’ve Got a Plan.</h2>
      <p className="lede">We understand that parenting is already a full-time responsibility.</p>
      <p>You want to support your child’s development, but finding the right activities every day, knowing what to do and keeping things age-appropriate can be overwhelming.</p>
      <p>That’s exactly why we created Lil Think. We’ve organised a simple daily activity plan designed around important developmental abilities. Every day, we’ll send you a fun activity directly to your email.</p>
      <p style={{color:"var(--ink)",fontWeight:600}}>No complicated preparation. No expensive toys. No hours spent searching the internet. Just simple, meaningful moments of play with your child.</p>
    </div>
    <div className="art" style={{animationDelay:"-3s"}}><HeroArt/></div>
  </div></section>
);

const How = () => (
  <section id="how" className="sec tint"><div className="w">
    <h2 style={{maxWidth:"18ch"}}>Three Simple Steps. That’s All It Takes.</h2>
    <ol className="steps">
      {STEPS.map(([t, d, c], i) => <li key={t} className="st" style={{ background: `var(--${c})` }}><div className="n">{i + 1}</div><h3>{t}</h3><p>{d}</p></li>)}
    </ol>
    <div className="mail" role="img" aria-label="Sample daily activity email: The Hidden Toy Game, practising memory">
      <div className="mh">From: <b>Lil Think</b><br/>Subject: <b>Today’s play: The Hidden Toy Game 🧸</b></div>
      <div className="mbd">
        <span className="tag">Memory</span><span className="tag" style={{background:"var(--y)"}}>Ages 2–5</span><span className="tag" style={{background:"var(--m)"}}>10 min</span>
        <p style={{color:"var(--ink)"}}><b>You’ll need:</b> a small toy and three cups.</p>
        <p><b>How to play:</b> Show your child the toy, hide it under one cup, then slide the cups around slowly. Ask, “Where did it go?” Take turns hiding it!</p>
        <p style={{margin:0}}><b>Talk about it:</b> “What do you remember?”</p>
      </div>
    </div>
    <p className="note" style={{textAlign:"center",margin:"16px auto 0"}}>A sample of what lands in your inbox.</p>
  </div></section>
);

const Reassure = () => (
  <section className="sec"><div className="w"><div className="warm">
    <h2>Don’t Worry About What to Teach. Just Enjoy Watching Them Grow.</h2>
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
      <p className="lede">Four quick thinking games to play together, right in your browser. Each one takes about two minutes and ends with an idea to try away from the screen.</p>
      <div className="cta"><a className="btn" href="/games/">Open the Play Zone</a></div>
      <p className="note">Free. No sign-up, no ads, nothing to download.</p>
    </div>
    <div className="pz" aria-hidden="true">
      {[["🃏","Match the Pairs","y"],["🔍","Odd One Out","m"],["🔷","What Comes Next?","s"],["😊","How Do They Feel?","p"]].map(([e, t, c]) =>
        <div key={t} style={{ background: `var(--${c})` }}><b>{e}</b><span>{t}</span></div>)}
    </div>
  </div></section>
);

const Faq = () => (
  <section id="faq" className="sec"><div className="w">
    <h2 style={{textAlign:"center",margin:"0 auto"}}>Questions Parents Ask.</h2>
    <div className="faq">
      {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
    </div>
  </div></section>
);

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
    <div className="ok" role="status"><div className="big" aria-hidden="true">🎉</div>
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
  <section id="join" className="sec tint"><div className="w"><div className="signup">
    <h2>Let’s Make Every Day a Little More Meaningful.</h2>
    <p>Join Lil Think and start receiving fun, play-based daily activities for your little one.</p>
    <SignupForm/>
  </div></div></section>
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

const App = () => <><Header/><main><Hero/><Why/><Abilities/><Explore/><Intro/><How/><Reassure/><PlayZone/><Faq/><Join/></main><Footer/><StickyCta/></>;

export default App;
