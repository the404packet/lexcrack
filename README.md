# ⚡ LexCrack — Word Game Solver

A fast, minimal full-stack word solver for Scrabble, Word City, and similar games.  
Built with **Fastify** (backend) + **React + Vite** (frontend). No database. Everything in memory.

---

## Features

- 🔤 Solve from any set of letters instantly
- ❓ Wildcard support (`?` as a blank tile)
- 📏 Filter results by word length
- 📚 Dual dictionary — common words prioritised, full SOWPODS coverage
- ⚡ Sub-100ms responses (in-memory, no DB)
- 🔒 Rate limiting, input validation, CORS, Helmet headers
- 🎨 Clean, responsive UI with expand/collapse per word length

---

## Project Structure

```
lexcrack/
├── backend/
│   ├── data/
│   │   ├── sowpods.txt      ← Full SOWPODS list (~267k words)
│   │   └── common.txt       ← Common English words (~10–20k words)
│   ├── server.js            ← Fastify server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Main UI component
│   │   ├── App.css          ← Styles
│   │   ├── index.css        ← Global styles + animations
│   │   └── main.jsx         ← React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started (Local)

### 1. Add the full word lists (recommended)

Replace the sample word lists with real ones for best results:

- **SOWPODS** (~267k words): Download from [jesstess/Scrabble](https://github.com/jesstess/Scrabble/blob/master/scrabble/sowpods.txt)
- **Common words** (~10k words): Any curated English frequency list works

Place them at:
```
backend/data/sowpods.txt
backend/data/common.txt
```

One word per line, lowercase. The server loads them once at startup.

### 2. Run the backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — the Vite dev server proxies `/solve` to the backend automatically.

---

## API

### `POST /solve`

**Request**
```json
{
  "letters": "aetr?",
  "lengths": [3, 4, 5]
}
```

| Field     | Type       | Required | Notes                                        |
|-----------|------------|----------|----------------------------------------------|
| `letters` | `string`   | ✅        | a–z and `?` only, max 15 chars               |
| `lengths` | `integer[]`| ❌        | Values 2–15. Omit to return all lengths.     |

**Response**
```json
{
  "3": ["ate", "eat", "eta", "rat", "tar"],
  "4": ["rate", "tear", "tare", "rare"],
  "5": ["rater", "tater"]
}
```

Keys are word lengths. Words are sorted: common words first, then alphabetically.

### `GET /health`

Returns `{ "status": "ok" }`. Useful for uptime checks.

---

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Environment variable**: `FRONTEND_ORIGIN=https://your-app.vercel.app`

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Import into [vercel.com](https://vercel.com)
3. Set environment variable:
   - `VITE_API_URL=https://your-render-app.onrender.com`
4. Deploy — Vercel auto-detects Vite

---

## Configuration

| Environment Variable | Where   | Default                  | Description                    |
|----------------------|---------|--------------------------|--------------------------------|
| `PORT`               | Backend | `3001`                   | Server port                    |
| `FRONTEND_ORIGIN`    | Backend | `http://localhost:5173`  | Allowed CORS origin            |
| `NODE_ENV`           | Backend | —                        | Set to `production` on Render  |
| `VITE_API_URL`       | Frontend| `''` (uses proxy)        | Backend URL for production     |

---

## Rate Limiting

`POST /solve` is limited to **60 requests per minute per IP**.  
Exceeding this returns a `429` response.

---

## Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Backend  | Node.js, Fastify, @fastify/cors, @fastify/helmet, @fastify/rate-limit |
| Frontend | React 18, Vite 5                      |
| Fonts    | Syne (display), DM Mono (code)        |
| Deploy   | Render (backend), Vercel (frontend)   |

---

## License

MIT © 2026 Somanshu Mahajan