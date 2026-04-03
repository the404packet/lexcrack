'use strict';

const Fastify = require('fastify');
const fs = require('fs');
const path = require('path');

// ─── Dictionary Loading ──────────────────────────────────────────────────────

function loadDictionary() {
  const dataDir = path.join(__dirname, 'data');

  const readWords = (filename) => {
    const file = path.join(dataDir, filename);
    if (!fs.existsSync(file)) return new Set();
    return new Set(
      fs.readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map(w => w.trim().toLowerCase())
        .filter(w => /^[a-z]{2,15}$/.test(w))
    );
  };

  const common = readWords('common.txt');
  const sowpods = readWords('sowpods.txt');

  // Merge: common words get score 3, sowpods-only get score 2
  const all = new Map();
  for (const w of common)  all.set(w, 3);
  for (const w of sowpods) if (!all.has(w)) all.set(w, 2);

  // Precompute: group by length, store { word, score, freq[] }
  const byLength = {};
  for (const [word, score] of all) {
    const len = word.length;
    if (!byLength[len]) byLength[len] = [];
    const freq = new Array(26).fill(0);
    for (const ch of word) freq[ch.charCodeAt(0) - 97]++;
    byLength[len].push({ word, score, freq });
  }

  // Pre-sort each length group: score desc, then alpha
  for (const len of Object.keys(byLength)) {
    byLength[len].sort((a, b) =>
      b.score - a.score || a.word.localeCompare(b.word)
    );
  }

  console.log(`[dict] loaded ${all.size} words across ${Object.keys(byLength).length} lengths`);
  return byLength;
}

const DICT = loadDictionary();

// ─── Solver ──────────────────────────────────────────────────────────────────

function solve(letters, lengths) {
  // Build freq array + wildcard count
  const freq = new Array(26).fill(0);
  let wilds = 0;
  for (const ch of letters) {
    if (ch === '?') wilds++;
    else freq[ch.charCodeAt(0) - 97]++;
  }

  const targetLengths = lengths && lengths.length > 0
    ? lengths
    : Object.keys(DICT).map(Number);

  const result = {};
  for (const len of targetLengths) {
    const group = DICT[len];
    if (!group) continue;

    const matches = [];
    for (const { word, score, freq: wf } of group) {
      let needed = 0;
      let ok = true;
      for (let i = 0; i < 26; i++) {
        const diff = wf[i] - freq[i];
        if (diff > 0) needed += diff;
        if (needed > wilds) { ok = false; break; }
      }
      if (ok) matches.push(word);
      if (matches.length >= 100) break; // max 100 per length
    }
    if (matches.length > 0) result[len] = matches;
  }
  return result;
}

// ─── Fastify App ─────────────────────────────────────────────────────────────

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production',
  trustProxy: true,
});

// Security headers
app.register(require('@fastify/helmet'), {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// CORS — only allow frontend origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.register(require('@fastify/cors'), {
  origin: [FRONTEND_ORIGIN, 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['POST', 'GET', 'OPTIONS'],
});

// Rate limiting
app.register(require('@fastify/rate-limit'), {
  max: 60,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Try again in a moment.',
  }),
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// ─── POST /solve ─────────────────────────────────────────────────────────────

app.post('/solve', {
  config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  schema: {
    body: {
      type: 'object',
      required: ['letters'],
      properties: {
        letters: { type: 'string', maxLength: 30 },
        lengths: {
          type: 'array',
          items: { type: 'integer', minimum: 2, maximum: 15 },
          maxItems: 14,
        },
      },
    },
  },
}, async (req, reply) => {
  let { letters, lengths } = req.body;

  // Sanitize letters
  letters = letters.replace(/\s+/g, '').toLowerCase();
  if (!/^[a-z?]+$/.test(letters)) {
    return reply.code(400).send({ error: 'Invalid characters. Use a–z and ? only.' });
  }
  if (letters.length < 1 || letters.length > 15) {
    return reply.code(400).send({ error: 'Letters must be 1–15 characters long.' });
  }

  // Validate lengths
  if (lengths) {
    const invalid = lengths.filter(n => n < 2 || n > 15);
    if (invalid.length) {
      return reply.code(400).send({ error: 'Word lengths must be between 2 and 15.' });
    }
    // Can't find words longer than input (plus wildcards)
    const maxPossible = letters.length;
    lengths = lengths.filter(n => n <= maxPossible);
  }

  const results = solve(letters, lengths);
  return reply.send(results);
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(`[server] LexCrack backend running on :${PORT}`);
});
