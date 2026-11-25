# Lil Think: deploy notes

Files:
- `src/page.html` (shared page head) · `src/site.css` (styles) · `src/home.jsx` (home page content) · `src/icons.jsx` (the icon set used instead of emoji)
- `src/games/` (the Play Zone: `index.jsx` lists the games, one file per game) · `src/games.css`
- `src/pages.jsx` (the list of pages, with each page's title and description) · `build.mjs` (builds everything into `dist/`)
- `public/` (robots.txt, icons, share image) · `api/subscribe.js` (signup) · `api/_welcome.js` (email content) · `.env.example`

To change the site, edit `src/` and push; the host runs `npm run build`. To preview locally: `npm install && npm run build`, then serve `dist/` with any static server.

## Play Zone
`/games/` is the hub and each of the 12 games has its own page (`/games/memory-match/` and so on), one game per ability on the home page. The games run entirely in the browser: no server calls, no accounts. Stars and the last level are remembered on the device only (browser local storage).
To add a game: write its `Play` component in `src/games/`, then add an entry to `GAMES` in `src/games/index.jsx`. Its page and sitemap entry are created by the build.

## Deploy on Vercel (simplest)
1. Put this folder in a GitHub repo (or run `npx vercel` inside it), import it into Vercel and add your domain. Set Build Command to `npm run build` and Output Directory to `dist`.
2. In Vercel > Settings > Environment Variables, add the values from `.env.example`.
   `RESEND_API_KEY` = create one in Resend > API Keys with **Full access** (the signup saves a contact as well as sending email, which a "Sending access" key cannot do).
3. Redeploy, then subscribe with your own email to test.

## Deploy on Netlify instead
1. Put this folder in a GitHub repo, then Netlify > Add new site > Import from Git. The build settings are already in `netlify.toml`.
2. Site configuration > Environment variables: add the values from `.env.example`.
3. Deploy, add your domain, then subscribe with your own email to test.

## Subscribers in Google Sheets
Each new subscriber is added to your Google Sheet with Balance 100 and Question Id 1.
1. Open the sheet > Extensions > Apps Script, and paste in `google-apps-script/Code.gs`. Change `SECRET` to a long random string.
2. Deploy > New deployment > Web app > Execute as **Me** > Who has access **Anyone** > Deploy, and approve the permission prompt.
3. In your host's environment variables set `SHEETS_WEBHOOK_URL` (the web app URL ending in `/exec`) and `SHEETS_WEBHOOK_SECRET` (the same secret), then redeploy.

The sheet's first row must be headings including `Email`, `Balance` and `Question Id` (an empty sheet gets them automatically). To change the starting values, edit `api/_sheet.js`.

If a row does not appear, look at the signup response (browser dev tools > Network > `subscribe`). `sheet` says what happened and `sheetRef` says why:
- `url-not-set`: `SHEETS_WEBHOOK_URL` is missing on the host, or the site was not redeployed after adding it.
- `unauthorized`: `SHEETS_WEBHOOK_SECRET` differs from `SECRET` in the script, or `SECRET` is still the `CHANGE-ME` placeholder.
- `not-json-…`: the URL is not the `/exec` web app URL, access is not **Anyone**, or the script crashed (Apps Script > Executions shows the error).
- `no_email_column` / `sheet_not_found`: the tab picked by `SHEET_GID` has no `Email` heading in row 1, or does not exist.
- `sheet: "added"` but no row where you look: the script is writing to a different tab; set `SHEET_GID` to the number after `gid=` in the tab's URL.

Subscribing again with an email that is already a contact adds its missing row, without a second welcome email.

## Search engines
The build writes the full page content into the HTML, so crawlers do not need to run JavaScript. The sharing tags are in `src/page.html`; titles and descriptions for each page are in `src/pages.jsx`, and the build writes `sitemap.xml` from that list.
After deploying: add `lilthink.com` in [Google Search Console](https://search.google.com/search-console), submit `https://lilthink.com/sitemap.xml`, and use URL Inspection > Request indexing on the home page.

## Before going live
- Resend: your domain `lilthink.com` must show **Verified**, and `FROM_EMAIL` must use it.
- Add your own email to a test run and check it lands in the inbox (not spam).
- The code checks for an existing contact first, so repeat signups don't get a second welcome email.
- Daily emails: send them with Resend Broadcasts (or n8n) so each one carries a proper unsubscribe link.
- Replace the Privacy Policy placeholder link in the footer before launch.
