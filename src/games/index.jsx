// The Play Zone: the hub at /games/ and one page per game.
import { GameShell, GHeader, GFooter, Stars } from "./shell.jsx";
import { loadStars } from "./util.js";
import { MemoryPlay } from "./memory.jsx";
import { OddPlay } from "./odd.jsx";
import { PatternPlay } from "./pattern.jsx";
import { FeelingsPlay } from "./feelings.jsx";
import { ShadowPlay } from "./shadow.jsx";
import { LightsPlay } from "./lights.jsx";
import { RedLightPlay } from "./redlight.jsx";
import { SwitchPlay } from "./switch.jsx";
import { StoriesPlay } from "./stories.jsx";
import { SoundsPlay } from "./sounds.jsx";
import { BunnyPlay } from "./bunny.jsx";
import { FacePlay } from "./face.jsx";
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
    how: "Read the question together, look at the faces and tap the one that fits.",
    metaTitle: "How Do They Feel? Free Feelings Game for Kids | Lil Think",
    metaDesc: "A free 2-minute feelings game for children aged 2–5. Match faces to emotions and little stories to practise naming feelings. No sign-up, no ads.",
    parents: "Reading faces and naming feelings is the start of understanding other people. Read each question to your child, so they do not need to read. On Tricky, a short story asks them to imagine how someone else feels. Afterwards, ask “when did you feel like that?”",
    tips: ["Make a happy, a sad and a surprised face in the mirror together, and guess each other’s.",
      "At story time, pause on a picture and ask, “How do you think they feel? How can you tell?”"] },
  { id: "shadow-match", Play: ShadowPlay, emoji: "🧩", tint: "s", title: "Shadow Match", ability: "Spatial Reasoning",
    blurb: "Look at the picture. Which shadow is the same shape?",
    how: "Look at the picture at the top, then tap the shadow that has the same shape.",
    metaTitle: "Shadow Match: Free Shape Matching Game for Toddlers | Lil Think",
    metaDesc: "A free 2-minute shadow matching game for children aged 2–5. Match each picture to its shadow and practise spatial reasoning. No sign-up, no ads.",
    parents: "Matching a picture to its shadow means ignoring colour and detail and looking only at the outline. On Tricky the shadows are turned around, so your child has to turn the shape in their head, which is the start of spatial reasoning. Trace the outline with a finger together if they get stuck.",
    tips: ["On a sunny day or with a torch, make shadows of a spoon, a cup and a toy on the wall. “Which shadow is which?”",
      "Draw around a few objects on paper, mix the objects up and let your child put each one back on its outline."] },
  { id: "copy-the-lights", Play: LightsPlay, emoji: "💡", tint: "l", title: "Copy the Lights", ability: "Working Memory",
    blurb: "Watch the lights, then tap them back in the same order.",
    how: "The shapes light up one after another. Watch first, then tap them in the same order.",
    metaTitle: "Copy the Lights: Free Working Memory Game for Kids | Lil Think",
    metaDesc: "A free 2-minute sequence memory game for children aged 2–5. Watch the lights and repeat the order to practise working memory. No sign-up, no ads.",
    parents: "Holding a short sequence in mind and then acting on it is working memory, the same skill your child uses to follow “shoes on, then coat, then bag”. Easy starts with just two lights. Saying the colours aloud while watching (“red, blue...”) is a real strategy, not cheating, so encourage it.",
    tips: ["Clap a short rhythm (clap, clap, tap your knees) and ask your child to copy it. Make it one beat longer each time.",
      "Give a two-step job, then three: “Touch your nose, then the door, then sit down.” Swap and let your child give you one."] },
  { id: "red-light-green-light", Play: RedLightPlay, emoji: "🚦", tint: "m", title: "Red Light, Green Light", ability: "Self-Regulation",
    blurb: "Walk Turtle home on green. Stop and wait on red.",
    how: "Tap the big button to walk when the light is green. When it turns red, stop and wait!",
    metaTitle: "Red Light, Green Light: Free Self-Control Game for Kids | Lil Think",
    metaDesc: "A free 2-minute stop-and-go game for children aged 2–5. Tap on green, wait on red, and practise self-control and patience. No sign-up, no ads.",
    parents: "Stopping yourself when you want to keep going is one of the hardest things for a young child, and it grows with practice. Here a tap on red only costs one small step back, so the waiting is practised without tears. On Tricky a yellow light also means wait. Praise the waiting, not the speed.",
    tips: ["Play it for real: your child walks when you say “green light” and freezes on “red light”. Then let them be the light.",
      "Put on music and dance, and freeze like statues every time it stops."] },
  { id: "switch-it", Play: SwitchPlay, emoji: "🔄", tint: "y", title: "Switch It!", ability: "Cognitive Flexibility",
    blurb: "Sort by colour... then the rule changes to shape!",
    how: "Tap where the piece belongs. First you sort one way, then the rule switches. Watch for the change!",
    metaTitle: "Switch It! Free Sorting Game for Preschoolers | Lil Think",
    metaDesc: "A free 2-minute sorting game for children aged 2–5. Sort by colour, then switch to shape, and practise flexible thinking. No sign-up, no ads.",
    parents: "Sorting by colour is easy. Dropping that rule and sorting the very same pieces by shape is not: young children often keep following the first rule even when they can tell you the new one. That switch is cognitive flexibility. If your child keeps using the old rule, that is normal for this age; say the new rule aloud together before each tap.",
    tips: ["Sort a pile of socks or blocks by colour. Then mix them up and say, “New rule! Now sort them by size.”",
      "Play opposites: when you say “day” they say “night”. After a while switch it: now you both say the same word."] },
  { id: "tiny-stories", Play: StoriesPlay, emoji: "🔗", tint: "p", title: "Tiny Stories", ability: "Logical Thinking",
    blurb: "Two pictures tell a story. What happens next?",
    how: "Read the little story under the two pictures together, then tap the picture that shows what happens next.",
    metaTitle: "Tiny Stories: Free What-Happens-Next Game for Kids | Lil Think",
    metaDesc: "A free 2-minute sequencing game for children aged 2–5. Two pictures tell a story; choose what happens next and practise cause and effect. No sign-up, no ads.",
    parents: "Working out what happens next means connecting cause and effect: sun on a snowman, a pin near a balloon, water on a plant. Read each story aloud to your child. After a right answer, ask “why?” and let your child explain the link in their own words; that explanation is the logical thinking.",
    tips: ["While cooking or bathing, ask “what will happen if...?” before you do it: “...we put the ice in the warm water?”",
      "Tell a three-part story about your day with one part missing: “We put our shoes on, then..., then we were at the park.”"] },
  { id: "first-sounds", Play: SoundsPlay, emoji: "💬", tint: "l", title: "First Sounds", ability: "Language & Communication",
    blurb: "Listen carefully. Find the word, the first sound or the rhyme.",
    how: "A grown-up reads the question aloud. Listen carefully, then tap the picture that answers it.",
    metaTitle: "First Sounds: Free Listening and Rhyming Game for Kids | Lil Think",
    metaDesc: "A free 2-minute listening game for children aged 2–5. Find the word, match first sounds and spot rhymes to build early language skills. No sign-up, no ads.",
    parents: "Hearing that “ball” and “banana” start the same way, or that “cat” and “hat” rhyme, is one of the strongest foundations for reading later. Easy is about listening for a word and finding it, Medium matches first sounds and Tricky finds rhymes. Read each question aloud, and say the picture names together before choosing.",
    tips: ["Play “I spy” with sounds: “I spy something that starts like ball.” Take turns.",
      "Make silly rhymes with your child’s name or favourite toy: “Teddy, ready, spaghetti!” Real words not required."] },
  { id: "bunny-home", Play: BunnyPlay, emoji: "🐰", tint: "m", title: "Get Bunny Home", ability: "Problem-Solving",
    blurb: "Find a path through the garden, around the trees.",
    how: "Tap the arrows to hop Bunny to the house. Trees are in the way, so you may need to go around!",
    metaTitle: "Get Bunny Home: Free Maze Game for Preschoolers | Lil Think",
    metaDesc: "A free 2-minute maze game for children aged 2–5. Guide the bunny home around the trees and practise planning and problem-solving. No sign-up, no ads.",
    parents: "A blocked path is a small problem to solve: try a way, bump into a tree, think again. That loop is exactly what problem-solving is. Every garden is new each time. Before the first hop, ask “which way do you think will work?” and trace the path with a finger, so your child plans before acting.",
    tips: ["Build a cushion-and-chair obstacle course and ask your child to find a way from the sofa to the door without touching the floor.",
      "Draw a simple maze on paper, or use tape on the floor, and take turns guiding a toy through it."] },
  { id: "make-a-face", Play: FacePlay, emoji: "🎨", tint: "y", title: "Make a Face", ability: "Creativity & Imagination", free: true, again: "Make another",
    blurb: "Mix hair, eyes, mouths and hats to invent a character.",
    how: "Choose the skin, hair, eyes, mouth and extras. There is no wrong answer: make anyone you like!",
    metaTitle: "Make a Face: Free Creative Character Game for Kids | Lil Think",
    metaDesc: "A free creative game for children aged 2–5. Mix hair, eyes, mouths and hats to invent a character, then tell their story. No sign-up, no ads.",
    parents: "This one has no right answer, on purpose. Choosing, changing your mind and inventing someone new is creative play, and the real value comes afterwards: ask who the character is, what they like and what happened to them today. Your child’s story matters far more than the picture.",
    tips: ["Give your character a name. What do they love to eat? Where do they live? Tell the story of their day together.",
      "Draw your character on paper and add a body, a pet and a house. What is the pet called?"] },
];

const Hub = () => {
  const [stars, setStars] = useState({});
  useEffect(() => { setStars(loadStars()); }, []);
  return (
    <main>
      <section className="g-hero w">
        <h1>The Play Zone: Little Games for Growing Minds.</h1>
        <p className="lede">Twelve quick thinking games for children aged 2–5, one for each of the 12 abilities little minds are growing. Each takes about two minutes and ends with an idea to try away from the screen.</p>
        <p className="note">Free. No sign-up, no ads. Best played together.</p>
        <div className="g-grid">
          {GAMES.map(g => (
            <div key={g.id} className="g-cardlink" style={{ background: `var(--${g.tint})` }}>
              <span className="g-ic" aria-hidden="true">{g.emoji}</span>
              <span className="g-ct">{g.title}</span>
              <span className="g-cd">{g.blurb}</span>
              <span className="g-meta"><span className="g-chip">{g.ability}</span><span className="g-chip">{g.free ? "No rules" : "2 min"}</span>
                {stars[g.id] > 0 && <Stars n={stars[g.id]} label={`Your best: ${stars[g.id]} of 3 stars`}/>}</span>
              {/* Only the button is the link, so a tap highlights the button and not the whole card */}
              <a className="g-go" href={`/games/${g.id}/`} aria-label={`Play ${g.title}`}>Play<span aria-hidden="true">→</span></a>
            </div>))}
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
      {!game.free && <p className="note">Levels: Easy suits most 2–3 year olds, Medium 3–4 and Tricky 4–5, but follow your child, not the label.</p>}
      <p className="g-more">More games: {GAMES.filter(g => g.id !== game.id).map((g, i) => <React.Fragment key={g.id}>{i > 0 && " · "}<a href={`/games/${g.id}/`}>{g.title}</a></React.Fragment>)}</p>
    </section>
  </main>
);

// page is "hub" or a game id
export const GamesApp = ({ page }) => {
  const game = GAMES.find(g => g.id === page);
  return <><GHeader hub={!game}/>{game ? <GameView game={game}/> : <Hub/>}<GFooter/></>;
};
