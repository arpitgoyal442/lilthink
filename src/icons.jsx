// Lil Think's own icon set: flat shapes in the site palette, used instead of emoji so they look the same on every device.
// <Icon name="memory"/> draws one; it is decorative, so always pair it with a text label.
const I = "#12352B", I2 = "#1C4A3C", G = "#D9A94A", Y = "#F1CF7A", C = "#E5836F", B = "#7FB3D5", L = "#A99BDB", M = "#9CC7A8", P = "#F2B8A2", S = "#EDBE95", CR = "#F6E7BF";

// Points of a five-pointed star centred on (cx, cy)
export const star = (cx, cy, R, r = R * 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2, d = i % 2 ? r : R;
    return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

const line = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };

const ICONS = {
  // teddy bear
  memory: <>
    <circle cx="13" cy="13" r="6.5" fill={G}/><circle cx="35" cy="13" r="6.5" fill={G}/>
    <circle cx="13" cy="13" r="3" fill={P}/><circle cx="35" cy="13" r="3" fill={P}/>
    <circle cx="24" cy="26" r="16" fill={G}/><ellipse cx="24" cy="31.5" rx="7.5" ry="6" fill={CR}/>
    <circle cx="17.5" cy="23" r="2" fill={I}/><circle cx="30.5" cy="23" r="2" fill={I}/>
    <ellipse cx="24" cy="29" rx="2.4" ry="1.7" fill={I}/><path d="M24 30.5v2.2M21.2 33.6q2.8 2.2 5.6 0" stroke={I} strokeWidth="1.8" {...line}/>
  </>,
  // shapes in a pattern, with one still to guess
  pattern: <>
    <circle cx="14" cy="14" r="8" fill={C}/><rect x="26" y="6" width="16" height="16" rx="4" fill={B}/>
    <rect x="6" y="26" width="16" height="16" rx="4" fill={B}/>
    <circle cx="34" cy="34" r="7" stroke={I} strokeWidth="2.6" strokeDasharray="3.4 3.6" {...line}/>
  </>,
  // magnifying glass
  attention: <>
    <path d="M29 29l11 11" stroke={I} strokeWidth="5.5" {...line}/>
    <circle cx="20" cy="20" r="12" fill="#D6E7F1" stroke={I} strokeWidth="3.6"/>
    <polygon points={star(20, 20.5, 6)} fill={G}/>
  </>,
  // two speech bubbles
  language: <>
    <path d="M14 6h12a9 9 0 0 1 9 9v3a9 9 0 0 1-9 9h-8l-7 6 1.6-6.6A9 9 0 0 1 5 18v-3a9 9 0 0 1 9-9z" fill={C}/>
    <path d="M27 24h8a8 8 0 0 1 8 8v1a8 8 0 0 1-4.6 7.2L40 45l-6.6-4H27a8 8 0 0 1-8-8v-1a8 8 0 0 1 8-8z" fill={L}/>
    <circle cx="13.5" cy="16.5" r="2.1" fill="#fff"/><circle cx="20" cy="16.5" r="2.1" fill="#fff"/><circle cx="26.5" cy="16.5" r="2.1" fill="#fff"/>
  </>,
  // three ideas joined up
  logic: <>
    <path d="M11 35L24 12l13 23z" stroke={I} strokeWidth="3" {...line}/>
    <circle cx="24" cy="12" r="7" fill={G}/><circle cx="11" cy="35" r="7" fill={C}/><circle cx="37" cy="35" r="7" fill={B}/>
  </>,
  // puzzle piece
  spatial: <path d="M13 17h4.2a5.5 5.5 0 1 1 7.6 0H29a4 4 0 0 1 4 4v4.2a5.5 5.5 0 1 1 0 7.6V37a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4v-4.2a5 5 0 1 0 0-7.6V21a4 4 0 0 1 4-4z" fill={M}/>,
  // light bulb
  bulb: <>
    <path d="M24 2.5v3.5M9 8.5l2.4 2.4M39 8.5l-2.4 2.4M3.5 22H7M41 22h3.5" stroke={G} strokeWidth="2.8" {...line}/>
    <path d="M24 9a12 12 0 0 0-7.6 21.3c1 .9 1.6 2 1.6 3.2V35h12v-1.5c0-1.2.6-2.3 1.6-3.2A12 12 0 0 0 24 9z" fill={Y}/>
    <path d="M20.5 23l3.5 3.5 3.5-3.5M24 26.5V34" stroke={I} strokeWidth="2" {...line}/>
    <rect x="18.5" y="35" width="11" height="4" rx="2" fill={I}/><rect x="21" y="40.5" width="6" height="3" rx="1.5" fill={I}/>
  </>,
  // painter's palette
  palette: <>
    <path fillRule="evenodd" d="M24 6a18 18 0 1 0 0 36c3 0 4.5-2 3.5-4.5-1.2-3 .5-5.5 4-5.5H36a6 6 0 0 0 6-6.5C41.5 14.5 34 6 24 6z" fill={S}/>
    <circle cx="14" cy="20" r="3.7" fill={C}/><circle cx="23" cy="13.5" r="3.7" fill={G}/><circle cx="33" cy="18" r="3.7" fill={B}/>
    <circle cx="13.5" cy="30" r="3.7" fill={L}/><circle cx="21" cy="36" r="3.2" fill={M}/>
  </>,
  // brain (matches the big one in "Why it matters")
  brain: <g transform="translate(-20 -10.65) scale(.275)">
    <path d="M160 70c-30-14-62 8-52 38-22 10-18 44 6 50-4 28 28 44 46 26 18 18 50 2 46-26 24-6 28-40 6-50 10-30-22-52-52-38z" fill={P} stroke={I} strokeWidth="9" strokeLinejoin="round"/>
    <path d="M160 74v108M130 112c14 4 20 14 30 14M190 112c-14 4-20 14-30 14M126 152c12-2 22 6 34 6" stroke={I} strokeWidth="7" opacity=".55" {...line}/>
  </g>,
  // two arrows swapping round
  flex: <>
    <path d="M10 24A14 14 0 0 1 36.1 17" stroke={B} strokeWidth="4.6" {...line}/><polygon points="39.6,23 40.5,14.2 31.7,19.5" fill={B}/>
    <path d="M38 24A14 14 0 0 1 11.9 31" stroke={C} strokeWidth="4.6" {...line}/><polygon points="8.4,25 7.5,33.8 16.3,28.5" fill={C}/>
  </>,
  // seedling in a pot
  sprout: <>
    <path d="M24 34V20" stroke={I} strokeWidth="3" {...line}/>
    <path d="M24 26c0-8-6-12.5-15-11.5C9 22.5 14.5 27 24 26z" fill={M}/><path d="M24 21c0-9 6.5-14.5 16-13.5C40 16.5 34 22 24 21z" fill="#6FAE86"/>
    <path d="M13 32h22l-2.6 11.5a2 2 0 0 1-2 1.5H17.6a2 2 0 0 1-2-1.5z" fill={C}/><rect x="11" y="30" width="26" height="5" rx="2.5" fill="#D26F5B"/>
  </>,
  // a grown-up and a child, with a heart
  social: <>
    <path d="M24 13c-4.5-3.3-6.5-5.3-6.5-7.8a3.3 3.3 0 0 1 6.5-1 3.3 3.3 0 0 1 6.5 1c0 2.5-2 4.5-6.5 7.8z" fill={C}/>
    <path d="M3 44c0-9.5 4.5-15 11.5-15S26 34.5 26 44z" fill={I2}/><circle cx="14.5" cy="21" r="7" fill={S}/>
    <path d="M23 44c0-8 4-12.5 10-12.5S43 36 43 44z" fill={G}/><circle cx="33" cy="25.5" r="5.8" fill={S}/>
  </>,
  // a cup lifted to show the toy underneath
  cup: <>
    <path d="M15 4h18a2 2 0 0 1 2 1.6l4.2 20.8a2 2 0 0 1-2 2.4H10.8a2 2 0 0 1-2-2.4L13 5.6A2 2 0 0 1 15 4z" fill={B}/>
    <path d="M9.6 22.5h28.8l.8 3.9a2 2 0 0 1-2 2.4H10.8a2 2 0 0 1-2-2.4z" fill="#5F9CC4"/>
    <circle cx="24" cy="38" r="6.5" fill={C}/><circle cx="21.8" cy="35.8" r="1.8" fill="#fff" opacity=".6"/><path d="M8 39.5h5M35 39.5h5" stroke={G} strokeWidth="2.8" {...line}/>
  </>,
  // a tower of blocks
  blocks: <>
    <rect x="6" y="27" width="17" height="17" rx="4" fill={C}/><rect x="25" y="27" width="17" height="17" rx="4" fill={B}/><rect x="15.5" y="8" width="17" height="17" rx="4" fill={L}/>
    <polygon points={star(24, 16.8, 5)} fill="#fff"/>
  </>,
  // open storybook
  book: <>
    <path d="M23 12C18 8.5 12 8 5 9.5v27c7-1.5 13-1 18 2.5z" fill={B}/><path d="M25 12c5-3.5 11-4 18-2.5v27c-7-1.5-13-1-18 2.5z" fill={L}/>
    <path d="M9.5 17c3-.5 6-.2 9.5 1M9.5 23.5c3-.5 6-.2 9.5 1M29 18c3.5-1.2 6.5-1.5 9.5-1M29 24.5c3.5-1.2 6.5-1.5 9.5-1" stroke="#fff" strokeWidth="2.2" opacity=".85" {...line}/>
  </>,
  // a heart with a smile
  heart: <>
    <path d="M24 42C11 32.5 5 26 5 17.5A10 10 0 0 1 24 13a10 10 0 0 1 19 4.5C43 26 37 32.5 24 42z" fill={C}/>
    <circle cx="18.5" cy="21" r="2" fill={I}/><circle cx="29.5" cy="21" r="2" fill={I}/><path d="M19 27q5 4.5 10 0" stroke={I} strokeWidth="2.3" {...line}/>
  </>,
  // two playing cards
  cards: <>
    <rect x="6" y="9" width="21" height="29" rx="5" fill={L} transform="rotate(-10 16.5 23.5)"/>
    <rect x="20" y="10" width="21" height="29" rx="5" fill={Y} transform="rotate(8 30.5 24.5)"/>
    <polygon points={star(30.5, 24.5, 7)} fill={I} transform="rotate(8 30.5 24.5)"/>
  </>,
  // traffic light
  traffic: <>
    <rect x="14" y="3" width="20" height="42" rx="10" fill={I}/>
    <circle cx="24" cy="12.5" r="4.8" fill={C}/><circle cx="24" cy="24" r="4.8" fill={Y}/><circle cx="24" cy="35.5" r="4.8" fill={M}/>
  </>,
  // bunny
  bunny: <>
    <ellipse cx="17" cy="13" rx="5" ry="11" fill={L} transform="rotate(-9 17 13)"/><ellipse cx="31" cy="13" rx="5" ry="11" fill={L} transform="rotate(9 31 13)"/>
    <ellipse cx="17" cy="14" rx="2.2" ry="7" fill={P} transform="rotate(-9 17 13)"/><ellipse cx="31" cy="14" rx="2.2" ry="7" fill={P} transform="rotate(9 31 13)"/>
    <circle cx="24" cy="31" r="13.5" fill={L}/>
    <circle cx="19" cy="29" r="2" fill={I}/><circle cx="29" cy="29" r="2" fill={I}/>
    <ellipse cx="24" cy="33.5" rx="2.2" ry="1.6" fill={C}/><path d="M24 35v1.5M21.3 38q2.7 2 5.4 0" stroke={I} strokeWidth="1.8" {...line}/>
  </>,
  // smiling face
  smile: <>
    <circle cx="24" cy="24" r="18" fill={Y}/><circle cx="13.5" cy="28" r="3.2" fill={C} opacity=".55"/><circle cx="34.5" cy="28" r="3.2" fill={C} opacity=".55"/>
    <path d="M15.5 21.5q2.5-3 5 0M27.5 21.5q2.5-3 5 0" stroke={I} strokeWidth="2.4" {...line}/><path d="M16.5 28.5q7.5 7 15 0" stroke={I} strokeWidth="2.6" {...line}/>
  </>,
  // a gold star with sparkles, for "you're in!"
  party: <>
    <polygon points={star(24, 25, 17, 8)} fill={G} stroke={G} strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="19.5" cy="23.5" r="1.8" fill={I}/><circle cx="28.5" cy="23.5" r="1.8" fill={I}/><path d="M20 28q4 3.5 8 0" stroke={I} strokeWidth="2" {...line}/>
    <circle cx="6" cy="9" r="2.6" fill={C}/><circle cx="42" cy="7" r="2.2" fill={B}/><circle cx="43" cy="40" r="2.6" fill={L}/><circle cx="5" cy="38" r="2.2" fill={M}/>
  </>,
};

export const Icon = ({ name, size = 34 }) => (
  <svg className="icn" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">{ICONS[name]}</svg>
);
