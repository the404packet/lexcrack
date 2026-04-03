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

## Getting Started (Local)

### 1. Run the backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — the Vite dev server proxies `/solve` to the backend automatically.

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

## Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Backend  | Node.js, Fastify, @fastify/cors, @fastify/helmet, @fastify/rate-limit |
| Frontend | React 18, Vite 5                      |
| Fonts    | Syne (display), DM Mono (code)        |

---

## License

MIT © 2026 Somanshu Mahajan