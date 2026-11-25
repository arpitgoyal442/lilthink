// Every page of the site. build.mjs renders each one to HTML and lists it in the sitemap.
import Home from "./home.jsx";
import { GamesApp, GAMES } from "./games/index.jsx";

export const PAGES = [
  { path: "/", page: "home", script: "home", css: [], render: () => <Home/>,
    title: "Free Daily Activities for Toddlers & Preschoolers | Lil Think",
    description: "Get one free, play-based learning activity for your 2–5 year old in your inbox every day. 10–15 minutes, no special toys, built around 12 early thinking skills." },
  { path: "/games/", page: "hub", script: "games", css: ["games"], render: () => <GamesApp page="hub"/>, crumbs: [["Play Zone", "/games/"]],
    title: "Play Zone: Free Thinking Games for Ages 2–5 | Lil Think",
    description: "12 free 2-minute brain games for toddlers and preschoolers: memory, patterns, shapes, sounds, feelings and more. Play together in your browser. No sign-up, no ads." },
  ...GAMES.map(g => ({ path: `/games/${g.id}/`, page: g.id, script: "games", css: ["games"], render: () => <GamesApp page={g.id}/>,
    crumbs: [["Play Zone", "/games/"], [g.title, `/games/${g.id}/`]], title: g.metaTitle, description: g.metaDesc })),
];
