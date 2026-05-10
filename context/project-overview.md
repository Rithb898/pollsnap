# PollSnap

## Overview

PollSnap is a full-stack polling platform that lets authenticated users create structured polls, share them via a public link, and collect feedback from both
authenticated and anonymous respondents. It solves the problem of lightweight, time-bound feedback collection — without the overhead of enterprise survey tools — by combining a clean poll builder, real-time analytics, and public result publishing in a single cohesive product.

## Goals

1. A signed-in user can create a poll with multiple single-choice questions, configure anonymity and expiry, and share it via a public link within 2 minutes.
2. Any respondent — authenticated or anonymous — can open the poll link, answer all mandatory questions, and submit feedback with zero friction.
3. The poll creator can monitor live response analytics and publish final results publicly through the same poll link after the poll closes.

## Core User Flow

1. User signs up or logs in via Better Auth.
2. User creates a poll — sets title, description, expiry time, response goal, and anonymity mode.
3. User adds questions, marks each as mandatory or optional, and adds answer options.
4. User activates the poll and copies the shareable public link.
5. Respondent opens the public link, sees a countdown to expiry and live participation count.
6. Respondent selects one option per question, completes all mandatory questions, and submits.
7. Creator's analytics dashboard updates in real-time — live response feed, per-question option counts, and goal progress bar.
8. After the poll expires or the creator manually closes it, the creator publishes the results.
9. Anyone visiting the poll link now sees the published results and response summaries instead of the response form.

## Features

### Poll Management

- Create polls with title, description, expiry datetime, and response goal.
- Add, edit, reorder, and delete questions and their options.
- Mark individual questions as mandatory or optional.
- Toggle anonymous vs authenticated response mode per poll.
- Poll status lifecycle: draft → active → closed → published.

### Public Response Experience

- Open poll via shareable link — no login required for anonymous polls.
- Single-choice selection per question.
- Client-side and server-side mandatory question validation.
- Anonymous deduplication via session token cookie.
- Authenticated deduplication via respondent ID.
- Live countdown timer showing time remaining until poll expiry.
- Live vote percentage bars updating in real-time as others respond (Wow A).
- Poll automatically becomes inactive after expiry — no further submissions accepted.

### Creator Analytics Dashboard

- Total response count and goal progress bar (Wow E).
- Live response feed — "Someone responded 3s ago" (Wow B).
- Per-question bar charts showing option counts and percentages.
- Overall participation rate and completion rate.
- All analytics update in real-time via WebSockets.

### Result Publishing

- Creator can publish results after poll closes.
- Published results are visible publicly via the same poll link.
- Published view shows final option counts and response summaries.

## Scope

### In Scope

- Single-choice (one answer per question) question type only.
- Anonymous and authenticated response modes.
- Poll expiry with automatic deactivation.
- Mandatory and optional question validation on frontend and backend.
- Real-time analytics dashboard with WebSockets.
- Live vote counts on the public poll page.
- Response goal progress bar and countdown timer.
- Result publishing and public results view.
- Monorepo with separate client and server packages.
- Deployment: Railway (server + DB + Redis), Vercel (client).

### Out of Scope

- Multiple-choice, ranking, or open-text question types.
- Team or collaborative poll management (multi-owner).
- Email invitations or respondent targeting.
- File upload attachments on questions or responses.
- Paid tiers, usage limits, or billing.
- Mobile native apps.
- AI-generated result summaries.
- Emoji reactions on poll submissions.

## Success Criteria

1. A signed-in user can create an active poll with at least two questions and receive a shareable link.
2. An anonymous respondent can submit a response without logging in, and cannot submit twice from the same browser session.
3. An authenticated respondent cannot submit more than one response to the same poll.
4. Submitting a response to an expired poll returns an error and the UI shows a "Poll Closed" state.
5. The creator's analytics dashboard reflects a new submission within 2 seconds via WebSocket without a page refresh.
6. The public poll page shows live option vote percentages updating in real-time.
7. After the creator publishes results, the poll link renders the results view instead of the response form for all visitors.
8. The project is deployed, publicly accessible, and the repository is public with a complete README.