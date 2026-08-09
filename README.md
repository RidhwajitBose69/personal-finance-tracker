# FinTrack — Personal Finance Tracker

Full-stack personal finance tracker with JWT authentication, MongoDB, expenses, income, budgets, analytics, AI insights, current bank balance, and money-owed tracking.

## Features

- User registration and login
- Password hashing with Node's built-in `scrypt`
- Signed JWT session tokens (7-day expiry)
- Protected API routes
- Per-user data isolation
- Current bank balance during registration
- Profile/balance update API
- Expense CRUD and analytics
- Income CRUD
- Budgets and spending comparison
- Money Owed: money you lent, money you owe, due dates, settlement and deletion
- AI financial insights with Gemini when `GEMINI_API_KEY` is configured
- Docker Compose with MongoDB, backend and frontend
- Production-ready Dockerfiles
- Render deployment blueprint

## Local development

### Option A — existing Node setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

MongoDB must be running at `mongodb://localhost:27017/finance-tracker`.

### Option B — Docker

From the project root:

```bash
docker compose up --build
```

Open `http://localhost:5173`.

## Environment variables

Backend `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your-long-random-secret
GEMINI_API_KEY=optional
```

Frontend uses `VITE_API_URL`; the default is `http://localhost:3000/api`.

## GitHub

`.env`, dependencies and build output are ignored. Commit source, lockfiles and configuration only.

```bash
git add .
git commit -m "Complete FinTrack authentication and money owed features"
git push
```

## Deployment

The repository includes `render.yaml`. On Render, create a Blueprint from the repository. Set `MONGODB_URI` to a MongoDB Atlas connection string and optionally set `GEMINI_API_KEY`. Set the frontend `VITE_API_URL` to the deployed backend URL ending in `/api`.
