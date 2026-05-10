# Code Standards

## General

- Keep modules small and single-purpose — each file should do one thing well
- Fix root causes, do not layer workarounds
- Do not mix unrelated concerns in one component, route, or module
- Prefer composition over inheritance
- Handle errors explicitly — never silently swallow exceptions

## TypeScript

- Strict mode is required throughout the project (strict: true in tsconfig)
- Avoid `any` — use explicit interfaces or narrowly scoped types
- Validate unknown external input at system boundaries (API routes, user input) using Zod
- Use `@/` path alias for imports within the same package (`@/lib/utils`, `@/shared/utils`)
- Prefer readonly types for immutable data structures
- Use `const` assertions for literal types where appropriate

## Express (Backend)

- Wrap async route handlers with `AsyncHandler` to ensure errors propagate to error middleware
- Use `ApiResponse` class for all successful responses (`ApiResponse.Success`, `ApiResponse.ok`, `ApiResponse.created`)
- Throw `ApiError` for error cases (`ApiError.badRequest`, `ApiError.notFound`, etc.)
- Controllers should be thin — delegate business logic to service layers
- Middleware order matters: error handler and not-found handler must be last in the chain
- Use Zod schemas for request validation before processing

## React (Frontend)

- Components use function declarations, not arrow functions
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Follow the component patterns in `components/ui/` — use class-variance-authority for variants
- Keep components small and focused; extract complex logic into custom hooks
- Use TypeScript for all props interfaces

## Styling

- Use Tailwind CSS with class-variance-authority for component variants
- Use the `cn()` utility for conditional class merging — never inline conditional strings
- Follow the existing design tokens (border-radius, colors defined in CSS variables)
- No hardcoded hex color values — use Tailwind's semantic color classes

## API Routes

- Routes are versioned under `/api/v1`
- Validate and parse request input (body, params, query) before any logic runs
- Use consistent response shape: `{ success, message, statusCode, data?, errors? }`
- Swagger documentation is auto-generated — keep JSDoc annotations current

## Data and Storage

- Use Drizzle ORM for all database operations
- Schemas live in `src/drizzle/schemas/` with table-centric naming (`usersTable`)
- Database logger is enabled in development mode only
- Never store secrets or credentials in the database schema files

## File Organization

### Backend (`backend/src/`)

- `modules/` — Feature-based modules (each with routes, controller, service)
- `drizzle/schemas/` — Drizzle table definitions
- `shared/configs/` — Configuration (env, swagger)
- `shared/errors/` — Error classes (ApiError)
- `shared/middlewares/` — Express middlewares
- `shared/utils/` — Shared utilities (ApiResponse, logger, async-handler)
- `shared/constants/` — Constants (status codes)
- `db/` — Database connection setup

### Frontend (`frontend/src/`)

- `components/ui/` — Reusable UI primitives (button, dialog, etc.)
- `hooks/` — Custom React hooks
- `lib/` — Utility functions (cn, etc.)
- `App.tsx` — Root application component
- `main.tsx` — Application entry point
