# Learn Hub LMS

Full-stack learning management system: **React (Vite)** frontend and **Express + TypeScript** backend with JWT auth, courses, enrollments, and instructor tools.

## Repository layout

| Path | Description |
|------|-------------|
| `frontend/` | SPA (React, Tailwind, shadcn-style UI) |
| `backend/` | REST API (Express, MySQL) |

## Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8+ (or compatible host)

## Security & environment files

- **Do not commit** `.env`, API keys, JWT secrets, or database passwords.
- This repo ignores env files via `.gitignore`. Use the **example** files only as templates:
  - `backend/.env.example` → copy to `backend/.env`
  - `frontend/.env.example` → optional; copy to `frontend/.env.local` if you need overrides
- If secrets were ever pushed to GitHub, **rotate** them (DB password, JWT secrets) and remove them from git history if needed.

### Backend (`backend/.env`)

Required variables (see `backend/.env.example`):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

Optional: `PORT`, `NODE_ENV`, `JWT_*_EXPIRES_IN`, `CORS_ORIGINS`, `COOKIE_DOMAIN`, `COOKIE_SECURE`.

### Frontend (`frontend/.env.local` or Vercel env)

- `VITE_API_URL` — Full API base URL including `/api` (e.g. `http://localhost:4000/api` locally, or `https://your-api.onrender.com/api` in production). The app defaults to `http://localhost:4000/api` when unset.

## Install & run

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL and JWT secrets

npm install
npm run dev
```

Default API: `http://localhost:4000` (see `PORT` in `.env`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default dev server is configured in Vite (typically port **8080**).

### Production build

```bash
cd frontend && npm run build
cd backend && npm run build && npm start
```

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production bundle → `dist/` |
| `frontend/` | `npm run test` | Vitest |
| `backend/` | `npm run dev` | ts-node-dev API |
| `backend/` | `npm run build` | Compile TypeScript |
| `backend/` | `npm start` | Run compiled server |

## Deploying: Vercel (frontend) + Render (backend)

This stack works on **Vercel + Render**, but the API and SPA live on **different origins**, so you must configure **environment variables** and **CORS / cookies** (changes in this repo already support that).

### 1. Render (backend)

1. Create a **Web Service**; set **Root Directory** to `backend` (or deploy only the `backend` folder).
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm start` (uses `dist/server.js`; Render injects `PORT` automatically).
4. Add **environment variables** in the Render dashboard (same as `backend/.env`):
   - `NODE_ENV=production`
   - All DB and JWT variables
   - **`CORS_ORIGINS`** — your exact Vercel URL(s), comma-separated, e.g. `https://your-app.vercel.app`
   - **`COOKIE_SECURE=true`** — required so the refresh-token cookie uses `Secure` + `SameSite=None` for cross-site browser requests from Vercel to Render
5. Ensure your **MySQL** is reachable from Render (e.g. Aiven / cloud DB with SSL if required; allow Render egress IPs if your host filters by IP).

### 2. Vercel (frontend)

1. Import the repo; set **Root Directory** to `frontend`.
2. **Framework preset:** Vite (build: `npm run build`, output: `dist`).
3. Add **`VITE_API_URL`** = `https://<your-render-service>.onrender.com/api` (use your real Render URL + `/api`).
4. `frontend/vercel.json` rewrites all routes to `index.html` so React Router works on refresh.

### 3. After deploy

- Open the **Vercel** URL and test login/signup. If requests fail with CORS errors, fix **`CORS_ORIGINS`** on Render (exact scheme + host, no trailing slash).
- If refresh/login loops, confirm **`COOKIE_SECURE=true`** on Render and HTTPS on both sides.

## License

Private / your license here.
