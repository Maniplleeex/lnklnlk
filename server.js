// Elfaria — minimal fullstack server
// Serves the frontend from /public and exposes a couple of small JSON APIs
// so the page is a real client/server app instead of one giant static file.
//
// Works both as a normal Node server (npm start -> node server.js) and as
// a Vercel serverless function (see vercel.json), which is why app.listen()
// is guarded and the app is exported at the bottom.

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- API: gallery data (titles/order live on the server, not hardcoded in HTML) ----
const CARDS = [
  { id: 1, num: 'I',   title: 'Regal',     img: '/assets/images/card-1-d198039093.jpg' },
  { id: 2, num: 'II',  title: 'Bashful',   img: '/assets/images/card-2-8d08aa9ec1.jpg' },
  { id: 3, num: 'III', title: 'Enchanted', img: '/assets/images/card-3-4d67371732.jpg' },
  { id: 4, num: 'IV',  title: 'Delighted', img: '/assets/images/card-4-cfb975700e.jpg' },
];

app.get('/api/cards', (req, res) => {
  res.json(CARDS);
});

// ---- API: now-playing track info ----
app.get('/api/track', (req, res) => {
  res.json({
    title: 'Masa Lalu',
    artist: 'Chaeroel',
    src: '/assets/audio/track-1-fe85a8e4b3.mp3',
    art: '/assets/images/vinyl-disc.png',
  });
});

// ---- API: simple visit counter, persisted to disk, to prove this is a real backend ----
// On Vercel the deployed filesystem is read-only except /tmp, so we write
// there when running as a serverless function (counter resets between cold
// starts, which is fine for a demo). Locally it writes to ./data instead.
const COUNTER_FILE = process.env.VERCEL
  ? path.join('/tmp', 'visits.json')
  : path.join(__dirname, 'data', 'visits.json');
function readVisits() {
  try {
    return JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8')).count || 0;
  } catch {
    return 0;
  }
}
function writeVisits(count) {
  fs.mkdirSync(path.dirname(COUNTER_FILE), { recursive: true });
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count }));
}

app.post('/api/visit', (req, res) => {
  const count = readVisits() + 1;
  writeVisits(count);
  res.json({ count });
});

app.get('/api/visit', (req, res) => {
  res.json({ count: readVisits() });
});

// Only start a real listening server when run directly (local dev / any
// normal Node host). On Vercel, the platform imports `app` and calls it
// per-request instead — calling listen() there is unnecessary and is what
// was silently failing before.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Elfaria running at http://localhost:${PORT}`);
  });
}

module.exports = app;
