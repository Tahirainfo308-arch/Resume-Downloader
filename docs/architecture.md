# Architecture

## Current Foundation

The repository is an npm workspaces monorepo with three top-level areas:

- `client/` — React + Vite + TypeScript single-page application.
- `server/` — Express + TypeScript REST API.
- `docs/` — Architecture and operational documentation.

The layered backend structure follows the approved roadmap even though the top-level folders use `client` and `server` instead of `apps/web` and `apps/api`.

## Request Flow

```text
Browser -> Vite dev server or CDN -> Express API -> MongoDB
                                      |
                                      +-> External providers
```

## API Conventions

- Base path: `/api/v1`.
- JSON response envelope.
- Health endpoints for liveness and readiness.
- HTTP-only cookies for authentication.
- Zod validation for request data and environment variables.
- Centralized error handling with request IDs.

## Brand System

CSS variables are the single source of truth for brand colors. Tailwind maps semantic names to those variables.

## Next Phase

The next implementation phase adds authentication, user/profile models, protected routes, and route guards according to the roadmap.
