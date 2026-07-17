# Local Development Guide

## Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- Git

## Initial Setup
1. **Clone the repository.**
2. **Environment Variables**: Copy `.env.example` to `.env`. Leave local defaults as-is unless testing external providers.
3. **Install Dependencies**:
   ```bash
   npm install
   ```

## Running the Application
The easiest way to develop locally is utilizing Docker Compose to spin up your backing services (PostgreSQL & Redis) alongside the Node API.

```bash
# Start Database, Redis, and the API
docker-compose up -d
```

If you prefer to run the Node API locally (for easier debugging/hot-reloading):
1. Change `DATABASE_URL` and `REDIS_URL` in `.env` to point to `localhost`.
2. Start infrastructure: `docker-compose up -d postgres redis`
3. Generate Prisma client: `npx prisma generate`
4. Run DB Migrations: `npx prisma migrate dev`
5. Start Node: `npm run dev`

## Accessing Services
- **API**: `http://localhost:3000/api/v1`
- **Frontend SPA**: `http://localhost:3000/`
- **Swagger Docs**: `http://localhost:3000/api-docs`

## Testing
```bash
# Run unit tests
npm run test:unit

# Run full suite with coverage
npm run test:coverage
```
