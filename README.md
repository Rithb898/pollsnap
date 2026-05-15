# PollSnap

PollSnap is a full-stack polling app for creating polls, sharing public links, and tracking responses with live analytics.

## Features

- Create, edit, activate, close, and publish polls
- Public poll response flow
- Anonymous or authenticated responses
- Real-time analytics with Socket.io
- Better Auth login and session handling
- PostgreSQL persistence with Drizzle ORM
- Redis-backed Socket.io pub/sub

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Express, TypeScript
- Auth: Better Auth
- Database: PostgreSQL
- ORM: Drizzle ORM
- Realtime: Socket.io
- Cache/PubSub: Redis

## Project Structure

- `frontend/` - Vite + React client
- `backend/` - Express + TypeScript API

## Prerequisites

- Node.js
- `pnpm`
- PostgreSQL
- Redis

## Installation

Install dependencies:

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

Create `backend/.env`:

```bash
PORT=8888
DATABASE_URL=postgres://user:pass@localhost:5432/pollsnap
CORS_ORIGIN=http://localhost:5173
BETTER_AUTH_SECRET=replace_with_a_long_random_secret
BETTER_AUTH_URL=http://localhost:8888
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIS_URL=redis://localhost:6379
```

If frontend points to a different backend, set `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8888
```

## Usage

Run backend:

```bash
cd backend
pnpm dev
```

Run frontend:

```bash
cd frontend
pnpm dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8888`
- Swagger docs: `http://localhost:8888/api/docs`

## Environment Variables

Backend requires:

- `PORT`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `REDIS_URL` optional

Frontend optional:

- `VITE_API_URL`

## API Documentation

Swagger docs:

- `http://localhost:<PORT>/api/docs`

## License

No license file yet.
