# Setup

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 8 or newer, or Docker

## First Run

```bash
npm install
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
npm run dev
```

Docker users can start MongoDB first:

```bash
docker compose up -d mongo
```

## Verification

```bash
npm run check
npm run build
```

## Troubleshooting

### Server starts but database is not ready

The API intentionally starts without blocking on MongoDB. Check readiness:

```bash
curl http://localhost:4000/api/v1/health/ready
```

Start MongoDB with Docker if the response reports `disconnected`.

### Client cannot call the API

Confirm `VITE_API_BASE_URL` in `client/.env`. With the Vite proxy enabled, the default value `/api/v1` is correct for local development.

### Formatting or lint failures

Run:

```bash
npm run format
npm run lint
```
