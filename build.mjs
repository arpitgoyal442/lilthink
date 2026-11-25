// Builds the site into dist/: compiles src/app.jsx, renders the page to real HTML ahead of time
// (so search engines see the full content without running JavaScript) and copies public/ as is.
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { createHash } from "node:crypto";
import { transform } from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const SITE = "https://lilthink.com";
const [template, source] = await Promise.all([readFile("src/index.html", "utf8"), readFile("src/app.jsx", "utf8")]);
const jsx = { loader: "jsx", jsx: "transform", target: "es2020" };

// 1) Browser script (React itself still comes from the CDN tags in the template)
const browser = (await transform(source, { ...jsx, format: "iife", minify: true })).code;

// 2) Render the same components to HTML
const server = (await transform(source, jsx)).code;
const App = new Function("React", "ReactDOM", `${server}\nreturn App;`)(React, null);
const html = renderToString(React.createElement(App));

// 3) Structured data: tells search engines who runs the site
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "Lil Think", url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, email: "hello@lilthink.com", slogan: "Little Minds. Big Discoveries." },
    { "@type": "WebSite", "@id": `${SITE}/#site`, name: "Lil Think", url: `${SITE}/`, inLanguage: "en", publisher: { "@id": `${SITE}/#org` },
      description: "Free, play-based daily activities for children aged 2–5, delivered by email." },
  ],
}).replace(/</g, "\\u003c");

const hash = createHash("sha256").update(browser).digest("hex").slice(0, 10);
const page = template.replace("<!--APP-->", () => html).replace("__JSONLD__", () => jsonLd).replace("__HASH__", hash);
for (const mark of ["<!--APP-->", "__JSONLD__", "__HASH__"]) if (page.includes(mark)) throw new Error(`template placeholder ${mark} was not filled`);

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await Promise.all([writeFile("dist/index.html", page), writeFile("dist/app.js", browser)]);
console.log(`built dist/ (index.html ${(page.length / 1024).toFixed(1)} kB, app.js ${(browser.length / 1024).toFixed(1)} kB)`);
