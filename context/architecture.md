# Architecture Context

## Stack

| Layer      | Technology                        | Role                                                         |
| ---------- | --------------------------------- | ------------------------------------------------------------ |
| Backend    | Node.js + Express + TypeScript    | REST API server, WebSocket server, business logic            |
| Frontend   | React + Vite + TypeScript         | SPA — poll builder, public response form, analytics dashboard|
| UI         | Tailwind CSS + shadcn/ui          | Styling and component primitives                             |
| Auth       | Better Auth                       | Session management, sign-up/login, token rotation            |
| ORM        | Drizzle ORM                       | Type-safe SQL query builder and schema migrations            |
| Database   | PostgreSQL                        | Primary persistent store — polls, questions, responses       |
| Cache/PubSub | Redis                           | Socket.io adapter for pub/sub, session store                 |
| WebSockets | Socket.io + @socket.io/redis-adapter | Real-time analytics push to creator dashboard and respondents|
| State      | Zustand                           | Client-side state — auth, poll builder, live analytics       |
| Charts     | Recharts                          | Animated bar charts on analytics dashboard                   |
| Deployment | VPS | Hosting and infrastructure                    |

## System Boundaries

- `server/src/routes/` — Express route definitions; maps HTTP verbs and paths to
  controllers; owns no business logic.
- `server/src/controllers/` — Request handlers; validates input, calls service
  layer or DB, returns responses.
- `server/src/middleware/` — Cross-cutting concerns: auth verification, creator
  ownership check, poll active state check, deduplication guard.
- `server/src/db/` — Drizzle schema definitions and migration files; single
  source of truth for the data model.
- `server/src/socket/` — Socket.io event handlers and room management; emits
  real-time events when responses are submitted.
- `server/src/lib/` — Shared utilities: Redis client, token helpers, analytics
  aggregation functions.
- `client/src/pages/` — Route-level React components; one file per page.
- `client/src/components/` — Reusable UI components: PollBuilder, ResponseForm,
  AnalyticsDashboard, CountdownTimer, LiveVoteBar.
- `client/src/hooks/` — Custom hooks: useSocket, usePoll, useAnalytics,
  useCountdown.
- `client/src/store/` — Zustand stores: authStore, pollStore, analyticsStore.
- `client/src/lib/` — Axios instance (base URL, interceptors), Socket.io client
  singleton.

## Storage Model

- **PostgreSQL**: All persistent application data — users (managed by Better
  Auth), polls, questions, options, responses, response_answers. Relational
  integrity enforced via foreign keys.
- **Redis**: Ephemeral data only — Socket.io pub/sub channel for multi-instance
  event fanout, Better Auth session store. Nothing in Redis is the system of
  record; loss of Redis does not cause data loss.

## Auth and Access Model

- Every user authenticates via Better Auth using email/password. Better Auth
  manages sessions with httpOnly cookies and handles refresh token rotation.
- Every poll has exactly one creator (`polls.creator_id`). Only the creator can
  edit, close, or publish their poll.
- Public poll links (`/p/:id`) are accessible without authentication. If the
  poll is set to anonymous mode, respondents are not required to log in.
- If a poll requires authenticated responses, unauthenticated visitors are
  redirected to login before accessing the response form.
- Anonymous deduplication: a `session_token` UUID is set in an httpOnly cookie
  on first visit and checked against `responses.session_token` on submit.
- Authenticated deduplication: `responses.respondent_id` is checked for
  uniqueness per poll before accepting a new submission.
- Analytics routes (`/api/polls/:id/analytics`) are protected — only the
  authenticated creator of that poll can access them.
- Published results routes (`/api/polls/:id/results`) are fully public — no auth
  required — but only return data when `polls.status = published`.

## Invariants

1. A response is never accepted for a poll where `expires_at < now()` or
   `status != active` — enforced in `pollActiveMiddleware` on the backend,
   regardless of frontend state.
2. `response_answers` must contain exactly one answer per mandatory question in
   the poll — validated on the backend before any response row is inserted;
   partial inserts are rolled back in a single transaction.
3. A respondent (identified by `respondent_id` or `session_token`) can have at
   most one `responses` row per poll — enforced by a unique constraint and
   checked in `dedupMiddleware` before the controller runs.
4. `polls.status` transitions are strictly one-directional:
   draft → active → closed → published. No backward transitions are permitted.
5. Only rows where `polls.status = published` are returned by the public results
   endpoint — the creator cannot expose partial or unfinished analytics
   accidentally.
6. All DB writes for a response submission (inserting `responses` +
   `response_answers`) execute inside a single Drizzle transaction — either
   everything commits or nothing does.
7. Socket.io events are emitted only after a successful DB commit — never
   optimistically — so the real-time dashboard is never ahead of persistent
   state.