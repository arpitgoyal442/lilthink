// Builds the site into dist/: every page in src/pages.jsx is rendered to real HTML ahead of time
// (so search engines see the full content without running JavaScript), scripts are compiled into
// dist/assets/, a sitemap is written, and public/ is copied as is.
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { build } from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const SITE = "https://lilthink.com";
const common = { bundle: true, jsx: "transform", target: "es2020", logLevel: "warning" };
globalThis.React = React; // the source files use React as a global, exactly as they do in the browser (CDN script)

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });

// 1) Browser scripts, named with a fingerprint so they can be cached for a long time
const out = await build({ ...common, entryPoints: { home: "src/home.entry.jsx", games: "src/games.entry.jsx" }, format: "iife", minify: true,
  outdir: "dist/assets", entryNames: "[name]-[hash]", metafile: true });
const scripts = {};
for (const [file, info] of Object.entries(out.metafile.outputs)) {
  const name = /src\/(\w+)\.entry\.jsx$/.exec(info.entryPoint || "")?.[1];
  if (name) scripts[name] = "/" + file.replace(/^dist\//, "");
}

// 2) The same components, bundled for Node, to render each page's HTML
const ssr = await build({ ...common, entryPoints: ["src/pages.jsx"], format: "esm", platform: "node", write: false });
const { PAGES } = await import("data:text/javascript;base64," + Buffer.from(ssr.outputFiles[0].text).toString("base64"));

const template = await readFile("src/page.html", "utf8");
const css = {};
for (const name of ["site", ...new Set(PAGES.flatMap(p => p.css))]) css[name] = await readFile(`src/${name}.css`, "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const p of PAGES) {
  const url = SITE + p.path;
  // Structured data: who runs the site, plus where this page sits in it
  const graph = [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "Lil Think", url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, email: "hello@lilthink.com", slogan: "Little Minds. Big Discoveries." },
    { "@type": "WebSite", "@id": `${SITE}/#site`, name: "Lil Think", url: `${SITE}/`, inLanguage: "en", publisher: { "@id": `${SITE}/#org` },
      description: "Free, play-based daily activities for children aged 2–5, delivered by email." },
    { "@type": "WebPage", "@id": `${url}#page`, url, name: p.title, description: p.description, isPartOf: { "@id": `${SITE}/#site` } },
  ];
  if (p.crumbs) graph.push({ "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ...p.crumbs].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + path })) });
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  const fill = {
    "<!--APP-->": renderToString(p.render()), __TITLE__: esc(p.title), __DESC__: esc(p.description), __URL__: url, __JSONLD__: jsonLd,
    __CSS__: ["site", ...p.css].map(n => css[n]).join("\n"), __BODYCLASS__: p.script, __PAGE__: p.page, __SCRIPT__: scripts[p.script],
  };
  if (!fill.__SCRIPT__) throw new Error(`no script built for ${p.path}`);
  const html = template.replace(/<!--APP-->|__[A-Z]+__/g, (m) => { if (!(m in fill)) throw new Error(`unknown template placeholder ${m}`); return fill[m]; });
  await mkdir("dist" + p.path, { recursive: true });
  await writeFile(`dist${p.path}index.html`, html);
  console.log(`  ${p.path.padEnd(26)} ${(html.length / 1024).toFixed(1)} kB`);
}

const today = new Date().toISOString().slice(0, 10);
await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  PAGES.map(p => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n") + "\n</urlset>\n");
console.log(`built ${PAGES.length} pages into dist/`);
