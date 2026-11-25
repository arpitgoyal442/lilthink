// The Play Zone: the hub at /games/ and one page per game.
import { GameShell, GHeader, GFooter, Stars } from "./shell.jsx";
import { loadStars } from "./sound.js";
import { MemoryPlay } from "./memory.jsx";
import { OddPlay } from "./odd.jsx";
import { PatternPlay } from "./pattern.jsx";
import { FeelingsPlay } from "./feelings.jsx";
const { useState, useEffect } = React;

// To add a game: write its Play component, then add an entry here. The build makes its page and sitemap entry.
export const GAMES = [
  { id: "memory-match", Play: MemoryPlay, emoji: "🃏", tint: "y", title: "Match the Pairs", ability: "Memory",
    blurb: "Flip the cards and find the pictures that match.",
    how: "Tap a card to turn it over, then find its twin. Remember where each picture is hiding!",
    metaTitle: "Match the Pairs: Free Memory Game for Toddlers | Lil Think",
    metaDesc: "A free 2-minute memory matching game for children aged 2–5. Flip the cards, find the pairs. No sign-up, no ads, plays in your browser.",
    parents: "Matching games ask your child to hold a picture and its place in mind while looking for its partner, which is working memory in action. Start on Easy with three pairs. Name each picture out loud as it turns over (“a dog... where was the other dog?”): saying it helps the memory stick.",
    tips: ["Hide a small toy under one of three cups, slide the cups around slowly and ask, “Where did it go?” Then swap roles.",
      "Put four things on a tray, let your child look, cover them and take one away. “What’s missing?”"] },
  { id: "odd-one-out", Play: OddPlay, emoji: "🔍", tint: "m", title: "Odd One Out", ability: "Attention & Focus",
    blurb: "Look closely. Which picture does not belong?",
    how: "Look at all the pictures. One of them is different from the others. Tap it!",
    metaTitle: "Odd One Out: Free Attention Game for Preschoolers | Lil Think",
    metaDesc: "A free 2-minute odd-one-out game for children aged 2–5. Spot the picture that doesn’t belong and practise attention and sorting. No sign-up, no ads.",
    parents: "Finding the odd one out means looking at every picture, noticing what the others share and spotting the one that breaks the rule. That is careful attention plus early sorting. Ask “why is it different?” after each answer; the explaining matters as much as the tapping.",
    tips: ["Line up three spoons and a sock. “Which one doesn’t belong?” Then let your child set one up for you.",
      "While tidying, sort toys into groups together: things with wheels, things that are soft, things that are red."] },
  { id: "what-comes-next", Play: PatternPlay, emoji: "🔷", tint: "s", title: "What Comes Next?", ability: "Pattern Recognition",
    blurb: "Follow the pattern of shapes and choose what comes next.",
    how: "The shapes make a pattern. Look along the row, then tap the shape that comes next.",
    metaTitle: "What Comes Next? Free Pattern Game for Kids 2–5 | Lil Think",
    metaDesc: "A free 2-minute pattern game for children aged 2–5. Finish the sequence of shapes and practise early maths thinking. No sign-up, no ads.",
    parents: "Repeating patterns are one of the first steps towards maths: your child has to find the part that repeats and predict what follows. Say the pattern aloud together like a chant (“red, blue, red, blue...”) and pause before the answer. Hearing the rhythm makes the rule easier to catch.",
    tips: ["Make a pattern with socks, blocks or spoons: red, blue, red, blue. “What comes next?” Then let your child start one for you.",
      "Clap a pattern (clap, clap, stomp... clap, clap, stomp) and ask your child to keep it going."] },
  { id: "feelings", Play: FeelingsPlay, emoji: "😊", tint: "p", title: "How Do They Feel?", ability: "Social Understanding",
    blurb: "Find the happy face, the sad face, the surprised face.",
    how: "Listen to the question, look at the faces and tap the one that fits.",
    metaTitle: "How Do They Feel? Free Feelings Game for Kids | Lil Think",
    metaDesc: "A free 2-minute feelings game for children aged 2–5. Match faces to emotions and little stories to practise naming feelings. No sign-up, no ads.",
    parents: "Reading faces and naming feelings is the start of understanding other people. Each question is read aloud, so your child does not need to read. On Tricky, a short story asks them to imagine how someone else feels. Afterwards, ask “when did you feel like that?”",
    tips: ["Make a happy, a sad and a surprised face in the mirror together, and guess each other’s.",
      "At story time, pause on a picture and ask, “How do you think they feel? How can you tell?”"] },
];

const Hub = () => {
  const [stars, setStars] = useState({});
  useEffect(() => { setStars(loadStars()); }, []);
  return (
    <main>
      <section className="g-hero w">
        <h1>The Play Zone: Little Games for Growing Minds.</h1>
        <p className="lede">Four quick thinking games for children aged 2–5. Each one takes about two minutes, practises one early ability and ends with an idea to try away from the screen.</p>
        <p className="note">Free. No sign-up, no ads. Best played together.</p>
        <div className="g-grid">
          {GAMES.map(g => (
            <a key={g.id} className="g-cardlink" href={`/games/${g.id}/`} style={{ background: `var(--${g.tint})` }}>
              <span className="g-ic" aria-hidden="true">{g.emoji}</span>
              <span className="g-ct">{g.title}</span>
              <span className="g-cd">{g.blurb}</span>
              <span className="g-meta"><span className="g-chip">{g.ability}</span><span className="g-chip">2 min</span>
                {stars[g.id] > 0 && <Stars n={stars[g.id]} label={`Your best: ${stars[g.id]} of 3 stars`}/>}</span>
              <span className="g-go">Play<span aria-hidden="true">→</span></span>
            </a>))}
        </div>
      </section>
      <section className="sec tint"><div className="w g-notes">
        <h2>Made to Play Together.</h2>
        <div className="g-three">
          <div><h3>Short on purpose</h3><p>Every game ends after one round of about two minutes. There are no endless levels and nothing pulling your child to keep going.</p></div>
          <div><h3>Kind to little learners</h3><p>No timers, no losing. A wrong tap just wobbles and your child tries again. Everyone finishes with at least one star.</p></div>
          <div><h3>Back to real play</h3><p>Each game finishes with a simple activity to do with real things at home, because that is where the best learning happens.</p></div>
        </div>
        <div className="g-cta"><p>Want a fresh play idea like these every day?</p><a className="btn" href="/#join">Get Free Daily Activities</a></div>
      </div></section>
    </main>
  );
};

const GameView = ({ game }) => (
  <main className="g-main">
    <div className="w"><GameShell game={game} Play={game.Play}/></div>
    <section className="w g-about">
      <h2>For parents: what this game practises</h2>
      <p>{game.parents}</p>
      <p className="note">Levels: Easy suits most 2–3 year olds, Medium 3–4 and Tricky 4–5, but follow your child, not the label.</p>
      <p className="g-more">More games: {GAMES.filter(g => g.id !== game.id).map((g, i) => <React.Fragment key={g.id}>{i > 0 && " · "}<a href={`/games/${g.id}/`}>{g.title}</a></React.Fragment>)}</p>
    </section>
  </main>
);

// page is "hub" or a game id
export const GamesApp = ({ page }) => {
  const game = GAMES.find(g => g.id === page);
  return <><GHeader hub={!game}/>{game ? <GameView game={game}/> : <Hub/>}<GFooter/></>;
};
