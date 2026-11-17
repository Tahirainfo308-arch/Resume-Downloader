# AGENTS.md

Permanent project rules for AI assistants and developers working in this repository.

## Project Identity

- Product name: AI Career Studio.
- Full-stack SaaS platform for resumes, portfolios, resume analysis, job matching, interviews, and AI career guidance.
- Follow `PROJECT_ROADMAP.md` unless a newer explicit instruction overrides it.
- The approved top-level folders are `client`, `server`, and `docs`. Keep frontend and backend separated.

## Brand Rules

Use only these exact colors:

- `--color-burgundy: #800020`
- `--color-beige: #F3E6D5`
- `--color-cream: #FFF9F2`
- `--color-rose: #D45060`
- `--color-dark: #302126`

Do not use purple, blue gradients, neon colors, or unrelated random colors. Add new visual colors only as restrained semantic aliases derived from the approved palette.

## Architecture Rules

- Client owns UI, routing, forms, client state, and the typed Axios API client.
- Server owns business logic, persistence, authentication, authorization, validation, and all external integrations.
- Never call AI, payment, storage, or database services directly from the client.
- All API routes are versioned under `/api/v1`.
- Responses use a consistent success/error envelope.
- Backend follows route → controller → service → repository → model layering as features are added.
- Use shared Zod schemas or equivalent mirrored schemas for frontend/backend validation as the project evolves.
- Authenticated endpoints must enforce role checks and object ownership.
- Premium features must be enforced server-side from subscription entitlements.

## Security Rules

- Never commit `.env` files, API keys, database credentials, payment secrets, or private keys.
- Only `.env.example` files are committed.
- Secrets belong in server environment variables only.
- JWTs are carried in secure HTTP-only cookies. Access tokens must be short-lived; refresh tokens must be rotated.
- Use Zod to validate all untrusted request data.
- Sanitize user-generated and AI-generated content before rendering or storing it as rich text.
- Never fabricate AI results, payment success, subscription state, notifications, or dashboard statistics.
- Test/mock adapters must never be selectable in production.

## Code Quality Rules

- Write strict TypeScript.
- Keep components and services small, focused, and reusable.
- Put reusable UI in `client/src/components`.
- Put feature code in `client/src/features` as features are added.
- Put server middleware in `server/src/middleware`.
- Put server configuration in `server/src/config`.
- Avoid code comments unless the reason for a line is non-obvious and cannot be expressed in code or documentation.
- Use accessible, semantic, keyboard-operable UI.
- Implement loading, error, empty, and success states for every data-driven feature.
- Make all screens responsive.

## Command Rules

Before committing or pushing, run:

```bash
npm run check
npm run build
```

Do not weaken lint, typecheck, formatting, or build settings to make a failing check pass. Fix the underlying problem.

## Git Rules

- Do not commit secrets or generated artifacts.
- Do not force-push.
- Do not amend commits unless explicitly requested.
- Commit only intended changes.
- Use concise commit messages matching repository style.
- Push only when explicitly requested.

## Current Scope

This initialization phase must not create the full application pages or fake feature data. It establishes a clean, runnable monorepo foundation only.
