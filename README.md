# Lil Think: deploy notes

Files: `index.html` (the site) · `api/subscribe.js` (sends the welcome email via Resend) · `api/_welcome.js` (email content) · `.env.example`

## Deploy on Vercel (simplest)
1. Put this folder in a GitHub repo (or run `npx vercel` inside it), import it into Vercel and add your domain.
2. In Vercel > Settings > Environment Variables, add the values from `.env.example`.
   `RESEND_API_KEY` = create one in Resend > API Keys (use "Sending access").
3. Redeploy, then subscribe with your own email to test.

## Deploy on Netlify instead
1. Put this folder in a GitHub repo, then Netlify > Add new site > Import from Git. No build command needed (`netlify.toml` is included).
2. Site configuration > Environment variables: add the values from `.env.example`.
3. Deploy, add your domain, then subscribe with your own email to test.

## Before going live
- Resend: your domain `lilthink.com` must show **Verified**, and `FROM_EMAIL` must use it.
- Add your own email to a test run and check it lands in the inbox (not spam).
- The code checks for an existing contact first, so repeat signups don't get a second welcome email.
- Daily emails: send them with Resend Broadcasts (or n8n) so each one carries a proper unsubscribe link.
- Replace the Privacy Policy placeholder link in the footer before launch.
