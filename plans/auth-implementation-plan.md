# Authentication Implementation Plan (Better Auth)

## Overview

Full-stack authentication implementation using Better Auth with email/password and OAuth (Google, GitHub) providers. Architecture: backend REST API routes + middleware, frontend pages + Zustand store, session-based with httpOnly cookies.

---

## Phase 1: Backend Configuration & Routes

**Goal**: Set up Better Auth backend infrastructure, configure providers, and expose auth endpoints.

**Duration**: ~2-3 hours

### Tasks

#### 1.1 Extend Better Auth Configuration
- **File**: `backend/src/lib/auth.ts`
- **Changes**:
  - Add email/password provider configuration
  - Add Google OAuth provider (requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  - Add GitHub OAuth provider (requires GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
  - Configure custom hooks for post-signup/login if needed
- **Dependencies**: None (independent)
- **Verification**: Better Auth config loads without errors; env variables validated

#### 1.2 Update Environment Configuration
- **File**: `backend/src/shared/configs/env.ts`
- **Changes**:
  - Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET validation
  - Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET validation
  - Add BETTER_AUTH_SECRET (random secure string for session signing)
  - Validate these variables exist in development and production
- **Dependencies**: None (independent)
- **Verification**: Env config exports all required auth variables; TypeScript strict mode passes

#### 1.3 Create Auth Routes Module
- **File**: `backend/src/modules/auth/auth.routes.ts`
- **Changes**:
  - Create Express Router
  - Mount Better Auth handler using `toNodeHandler()` at `/*` to catch all auth paths
  - Export router for integration
- **Pattern**: Follow existing module structure (health module)
- **Dependencies**: Task 1.1 (Better Auth config)
- **Verification**: Routes export without errors; handler function exists

#### 1.4 Integrate Auth Routes into Main Router
- **File**: `backend/src/routes/index.ts`
- **Changes**:
  - Import auth routes
  - Add `/auth` route handler
  - Verify CORS credentials flag is `true` in app.ts for cookie-based auth
- **Dependencies**: Task 1.3 (auth routes created)
- **Verification**: Server starts without errors; `/api/v1/auth/*` path accessible

#### 1.5 Create Auth Middleware
- **File**: `backend/src/shared/middlewares/auth.middleware.ts`
- **Changes**:
  - Create `verifySession()` middleware that extracts session from Better Auth
  - Attach authenticated user to `req.user`
  - Create `requireAuth` middleware wrapper for protected routes
  - Handle session validation errors (return 401)
- **Dependencies**: Task 1.1 (Better Auth config)
- **Verification**: Middleware attaches user to request; returns 401 for invalid sessions

#### 1.6 Add Protected Route Pattern (`/api/v1/me`)
- **File**: `backend/src/routes/index.ts` (or new `backend/src/modules/user/user.routes.ts`)
- **Changes**:
  - Create GET `/me` endpoint that returns current authenticated user
  - Apply `requireAuth` middleware
  - Return user object with id, name, email
- **Dependencies**: Task 1.5 (auth middleware)
- **Verification**: `/me` endpoint returns current user with valid session; returns 401 without session

#### 1.7 Update Swagger Documentation
- **File**: `backend/swagger.config.ts`
- **Changes**:
  - Document `/api/v1/auth/sign-in/credentials` endpoint
  - Document `/api/v1/auth/sign-up/credentials` endpoint
  - Document `/api/v1/auth/sign-out` endpoint
  - Document `/api/v1/me` protected endpoint
  - Include example requests/responses
- **Dependencies**: Task 1.6 (endpoints created)
- **Verification**: Swagger UI displays auth endpoints with correct schemas

---

## Phase 2: Frontend Auth Pages & State Management

**Goal**: Build authentication UI and state management for session handling.

**Duration**: ~2-3 hours

**Can run in parallel with Phase 1** (independent frontend/backend)

### Tasks

#### 2.1 Create Auth Zustand Store
- **File**: `frontend/src/store/authStore.ts`
- **Changes**:
  - Create Zustand store for user state (user, loading, error)
  - Methods: `setUser()`, `logout()`, `checkSession()` (fetch `/api/v1/me`)
  - Handle session expiry + auto-logout on 401
  - Persist user in localStorage (optional, for faster hydration)
- **Dependencies**: None (independent)
- **Verification**: Store exports without errors; state updates correctly

#### 2.2 Create useAuth Custom Hook
- **File**: `frontend/src/hooks/useAuth.ts`
- **Changes**:
  - Export `user`, `loading`, `error` from authStore
  - Auto-verify session on first mount
  - Provide `logout()` method
- **Dependencies**: Task 2.1 (auth store)
- **Verification**: Hook returns user and loading state; calls checkSession on mount

#### 2.3 Create Login Page
- **File**: `frontend/src/components/Auth/LoginPage.tsx`
- **Changes**:
  - Email/password form with Zod validation
  - POST to `/api/auth/sign-in/credentials` endpoint
  - Google OAuth button (link to `/api/auth/sign-in/google`)
  - GitHub OAuth button (link to `/api/auth/sign-in/github`)
  - Display errors (invalid email, wrong password, network)
  - Link to signup page
  - Redirect to `/` on successful login
- **Dependencies**: Task 2.1 (auth store for setUser)
- **Verification**: Form submits to correct endpoint; redirects on success; errors display

#### 2.4 Create Signup Page
- **File**: `frontend/src/components/Auth/SignupPage.tsx`
- **Changes**:
  - Name/email/password form with Zod validation
  - POST to `/api/auth/sign-up/credentials` endpoint
  - Google OAuth button
  - GitHub OAuth button
  - Field-level validation feedback
  - Link to login page
  - Redirect to `/` on successful signup
- **Dependencies**: Task 2.1 (auth store for setUser)
- **Verification**: Form submits to correct endpoint; creates user; redirects on success

#### 2.5 Create useLogout Hook
- **File**: `frontend/src/hooks/useLogout.ts`
- **Changes**:
  - POST to `/api/auth/sign-out` endpoint
  - Clear auth store
  - Redirect to `/auth/login`
- **Dependencies**: Task 2.1 (auth store for logout)
- **Verification**: Logout clears user and redirects

#### 2.6 Create Navigation Header Component
- **File**: `frontend/src/components/Navigation.tsx`
- **Changes**:
  - Show user name + logout button if authenticated
  - Show login/signup links if unauthenticated
  - Use `useAuth` hook for state
  - Responsive design (mobile-friendly)
- **Dependencies**: Task 2.2 (useAuth hook)
- **Verification**: Header displays correct UI based on auth state

#### 2.7 Create ProtectedRoute Component
- **File**: `frontend/src/components/ProtectedRoute.tsx`
- **Changes**:
  - Wrapper that checks `useAuth.user`
  - Redirects to `/auth/login` if unauthenticated
  - Shows loading spinner while session is being verified
- **Dependencies**: Task 2.2 (useAuth hook)
- **Verification**: Unauthenticated users redirected to login

#### 2.8 Update Main Router
- **File**: `frontend/src/main.tsx`
- **Changes**:
  - Add `/auth/login` route → LoginPage
  - Add `/auth/signup` route → SignupPage
  - Wrap existing poll routes with `ProtectedRoute`
  - Example: `<ProtectedRoute><Route path="/polls" element={<PollsPage />} /></ProtectedRoute>`
- **Dependencies**: Task 2.3, 2.4, 2.7 (auth pages + ProtectedRoute)
- **Verification**: Routes render correctly; protected routes redirect when not authenticated

#### 2.9 Update App Root Component
- **File**: `frontend/src/App.tsx`
- **Changes**:
  - Call `authStore.checkSession()` in `useEffect` on mount
  - Show loading spinner while `authStore.loading === true`
  - Render app content once session state is resolved
- **Dependencies**: Task 2.1 (auth store)
- **Verification**: App hydrates session on load; shows spinner during verification

---

## Phase 3: Integration Testing & Deployment

**Goal**: Verify full auth flow works end-to-end; deploy to staging/production.

**Duration**: ~1-2 hours

**Depends on**: Phase 1 + Phase 2 complete

### Tasks

#### 3.1 Manual E2E Testing
- **Scenarios**:
  - [ ] Sign up with email/password → user created in database
  - [ ] Login with correct credentials → session cookie set, user in state
  - [ ] Login with wrong password → error displayed
  - [ ] Login with nonexistent email → error displayed
  - [ ] Access protected route without session → redirected to login
  - [ ] Logout → session destroyed, user cleared, redirected to login
  - [ ] OAuth (Google) → redirect to Google, return to app, user created
  - [ ] OAuth (GitHub) → redirect to GitHub, return to app, user created
  - [ ] Refresh page with valid session → session persists
  - [ ] Session timeout (if applicable) → auto-logout, redirect to login
- **Verification**: All scenarios pass without errors

#### 3.2 Database Verification
- **Checks**:
  - [ ] Users table has correct data (id, name, email, created_at, etc.)
  - [ ] Sessions table populated correctly
  - [ ] OAuth accounts linked properly (account table has correct provider data)
- **Verification**: Data integrity confirmed; no duplicate sessions

#### 3.3 Update Progress Tracker
- **File**: `context/progress-tracker.md`
- **Changes**:
  - Mark phases complete
  - Update current phase
  - Document any blockers or decisions
- **Verification**: Progress file reflects current state

#### 3.4 Deploy to Staging
- **Steps**:
  - Build backend: `npm run build`
  - Build frontend: `npm run build`
  - Deploy to Railway (backend) and Vercel (frontend)
  - Set env variables in deployment platforms (GOOGLE_*, GITHUB_*, BETTER_AUTH_SECRET)
  - Verify auth flow works in staging environment
- **Verification**: Staging deployment successful; auth flow works

#### 3.5 Update OAuth Redirect URIs
- **For Each Provider (Google, GitHub)**:
  - Add staging URL to authorized redirect URIs
  - Add production URL to authorized redirect URIs
  - Example for Google: `https://staging.pollsnap.app/auth/callback`, `https://pollsnap.app/auth/callback`
- **Verification**: OAuth redirects work; no "redirect URI mismatch" errors

#### 3.6 Final Production Deployment
- **Steps**:
  - Merge auth branch to main
  - Trigger production deployment
  - Verify all env variables set in production
  - Test full auth flow in production
- **Verification**: Production auth working; no errors in logs

---

## Implementation Order

**Recommended Execution**:

1. **Phase 1** (Backend) — Execute tasks sequentially:
   - 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7

2. **Phase 2** (Frontend) — Can run in parallel with Phase 1:
   - 2.1 → 2.2 → [2.3 & 2.4 & 2.5 in parallel] → 2.6 → 2.7 → 2.8 → 2.9

3. **Phase 3** (Integration) — After Phases 1 & 2:
   - 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6

**Total Duration**: ~5-8 hours (accounting for testing, debugging, deployments)

---

## Key Files Summary

### Backend (Backend/src)
| File | Status | Task(s) |
|------|--------|---------|
| `lib/auth.ts` | MODIFY | 1.1 |
| `shared/configs/env.ts` | MODIFY | 1.2 |
| `modules/auth/auth.routes.ts` | CREATE | 1.3 |
| `routes/index.ts` | MODIFY | 1.4, 1.6 |
| `shared/middlewares/auth.middleware.ts` | CREATE | 1.5 |
| `swagger.config.ts` | MODIFY | 1.7 |

### Frontend (frontend/src)
| File | Status | Task(s) |
|------|--------|---------|
| `store/authStore.ts` | CREATE | 2.1 |
| `hooks/useAuth.ts` | CREATE | 2.2 |
| `hooks/useLogout.ts` | CREATE | 2.5 |
| `components/Auth/LoginPage.tsx` | CREATE | 2.3 |
| `components/Auth/SignupPage.tsx` | CREATE | 2.4 |
| `components/Navigation.tsx` | CREATE | 2.6 |
| `components/ProtectedRoute.tsx` | CREATE | 2.7 |
| `main.tsx` | MODIFY | 2.8 |
| `App.tsx` | MODIFY | 2.9 |

### Context
| File | Status | Task(s) |
|------|--------|---------|
| `context/progress-tracker.md` | MODIFY | 3.3 |

---

## Environment Variables Required

```bash
# OAuth - Google
GOOGLE_CLIENT_ID=<from Google Console>
GOOGLE_CLIENT_SECRET=<from Google Console>

# OAuth - GitHub
GITHUB_CLIENT_ID=<from GitHub Console>
GITHUB_CLIENT_SECRET=<from GitHub Console>

# Better Auth
BETTER_AUTH_SECRET=<random 32+ char string>

# Backend
DATABASE_URL=<PostgreSQL connection>
CORS_ORIGIN=<frontend URL>

# Frontend
VITE_API_BASE_URL=<backend URL>
```

---

## Success Criteria

- [ ] User can sign up with email/password
- [ ] User can log in with existing credentials
- [ ] User can log out (session destroyed)
- [ ] User can sign in with Google OAuth
- [ ] User can sign in with GitHub OAuth
- [ ] Unauthenticated users redirected to login page
- [ ] Session persists across page refresh
- [ ] Protected routes return 401 without valid session
- [ ] Navigation header shows user info when authenticated
- [ ] All endpoints documented in Swagger
- [ ] Full auth flow works in production deployment

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OAuth credentials misconfigured | Auth flow fails | Document setup steps; validate in env.ts |
| Session cookies not sent (CORS) | Auth fails silently | Verify credentials: true in CORS config |
| Email verification required | User friction | Skip verification for MVP (Better Auth supports it) |
| Token refresh on 401 | Session expires unexpectedly | Implement axios interceptor to retry on 401 |
| Multiple domains | Cookie issues | Document subdomain configuration |

---

## Further Decisions (Post-MVP)

1. **Password Reset Flow** — Should implement after MVP using Better Auth `passwordReset` plugin
2. **Email Verification** — Should add post-launch using Better Auth `emailVerification` plugin
3. **Two-Factor Authentication** — Future enhancement using Better Auth `2fa` plugin
4. **Role-Based Access Control** — Future feature for admin management
