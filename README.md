# Elfaria — fullstack

## What changed from the single-HTML version

1. **Fixed the "Enchanted card triggers on scroll" bug.**
   Two things were causing it:
   - The reveal-on-scroll animation used `toggleActions: 'play none none reverse'`,
     which replayed the fade/blur animation *every time* a card crossed the
     trigger line — including tiny back-and-forth scroll wobbles on a phone.
     Now it plays once (`once: true`) and stays revealed.
   - The `:hover` styles (glow, zoom, overlay) had no `pointer`/`hover` guard,
     so mobile browsers applied them on tap-and-scroll and left cards looking
     "stuck" highlighted. They're now wrapped in
     `@media (hover:hover) and (pointer:fine)` so only real mice trigger them.

2. **Play button now shows your vinyl disc image** instead of the character
   face it used before (`public/assets/images/vinyl-disc.png`).

3. **Real audio playback** — the song is served as an actual `.mp3` file
   (`public/assets/audio/track-1-fe85a8e4b3.mp3`) instead of a multi-megabyte
   base64 string stuffed into the HTML, so the page loads faster and the
   audio streams properly.

4. **Actually fullstack now**, not a single HTML file:
   - `server.js` — a small Express server
   - `public/` — the frontend (HTML/CSS/JS + images/audio as real files)
   - `GET /api/track` — returns now-playing metadata (title, artist, audio
     src, art), which the player fetches on load instead of hardcoding it
   - `GET /api/cards` — the showcase card data
   - `POST /api/visit` / `GET /api/visit` — a tiny persisted visit counter
     (`data/visits.json`) to prove there's a real backend behind it

## Run it locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

(`npm install` couldn't be run in this environment — no outbound network
access here — so please run it once on your machine before starting.)

## Deploy to Vercel

The earlier version showed **"Cannot GET /"** on Vercel because a plain
`app.listen()` Express server doesn't run as-is on Vercel — it needs to be
deployed as a serverless function. That's now fixed via `vercel.json`:

1. Push this whole folder (including `vercel.json`, `server.js`, `public/`,
   `package.json`) to your GitHub repo.
2. In Vercel, import the repo (or just push to the branch it's already
   connected to) — no extra dashboard config needed, `vercel.json` handles
   the build + routing.
3. Every request now gets routed into `server.js`, which serves the frontend
   from `public/` and answers the `/api/*` routes.

Notes specific to serverless hosting:
- The visit counter (`/api/visit`) writes to `/tmp` instead of `./data` on
  Vercel, since the deployed filesystem is read-only outside `/tmp`. The
  count can reset between cold starts — that's expected and fine for a demo
  counter, not something to "fix".
- Static assets (`public/assets/**`) are explicitly included via
  `includeFiles` in `vercel.json`, since Vercel doesn't automatically bundle
  non-code files with a Node function otherwise.
