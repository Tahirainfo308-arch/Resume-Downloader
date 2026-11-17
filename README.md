# AI Career Studio

AI Career Studio is a full-stack SaaS platform for creating ATS-friendly resumes, building portfolios, analyzing resumes, matching job descriptions, preparing for interviews, and receiving AI career guidance.

Current status: foundation setup only. Application modules are implemented in phases defined in `PROJECT_ROADMAP.md`.

## Stack

### Client

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Axios
- React Hook Form
- Zod
- Lucide React

### Server

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod

## Repository Structure

```text
.
├── client/             React + Vite frontend
├── server/             Express + TypeScript API
├── docs/               Architecture and operational documentation
├── PROJECT_ROADMAP.md  Approved implementation plan
├── AGENTS.md           Permanent project rules for AI assistants
└── package.json        npm workspaces and shared scripts
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 8 or newer, local or managed
- Docker is optional for local MongoDB

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment files:

   ```bash
   Copy-Item server\.env.example server\.env
   Copy-Item client\.env.example client\.env
   ```

   On macOS/Linux:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Optional: start local MongoDB:

   ```bash
   docker compose up -d mongo
   ```

4. Start both applications:

   ```bash
   npm run dev
   ```

   - Client: `http://localhost:5173`
   - Server: `http://localhost:4000/api/v1`

The API starts even when MongoDB is unavailable. Health endpoints report database readiness separately.

## Commands

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start client and server in development mode |
| `npm run dev:client`   | Start only the client                       |
| `npm run dev:server`   | Start only the server                       |
| `npm run build`        | Build server and client                     |
| `npm start`            | Run the compiled server                     |
| `npm run typecheck`    | Typecheck both workspaces                   |
| `npm run lint`         | Lint the repository                         |
| `npm run format`       | Format files with Prettier                  |
| `npm run format:check` | Verify formatting                           |
| `npm run check`        | Run typecheck, lint, and format checks      |
| `npm run verify`       | Run checks and production builds            |

## Brand Tokens

| Token              | Value     |
| ------------------ | --------- |
| `--color-burgundy` | `#800020` |
| `--color-beige`    | `#F3E6D5` |
| `--color-cream`    | `#FFF9F2` |
| `--color-rose`     | `#D45060` |
| `--color-dark`     | `#302126` |

These tokens are defined in `client/src/styles/tokens.css` and mapped into Tailwind in `client/tailwind.config.ts`.

## Health Endpoints

| Endpoint            | Purpose                |
| ------------------- | ---------------------- |
| `GET /health/live`  | Process liveness       |
| `GET /health/ready` | MongoDB readiness      |
| `GET /health`       | Combined health status |

All API routes are prefixed with `/api/v1`.

## Documentation

- `PROJECT_ROADMAP.md` — approved architecture and phased implementation plan
- `AGENTS.md` — permanent rules for development assistants
- `docs/architecture.md` — current architecture summary
- `docs/setup.md` — setup and troubleshooting notes
