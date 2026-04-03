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

Open [http://localhost:5173](http://localhost:5173) 

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