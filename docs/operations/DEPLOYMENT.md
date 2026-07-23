# Deployment Guide

## Production Environment
The application runs on Node.js with PM2 for process management and clustering. The database is hosted on Supabase (managed PostgreSQL).

## Prerequisites
- Node.js (v20+)
- Supabase project (for PostgreSQL database)
- Redis (v7+)
- PM2 (installed globally: `npm install -g pm2`)

## Deployment Steps
1. Copy the project files to the server.
2. Rename `.env.example` to `.env` and fill in secure production secrets (DO NOT commit this file).
3. Set `DATABASE_URL` to your Supabase connection string (found in Supabase Dashboard → Settings → Database → Connection string).
4. Install dependencies:
   ```bash
   npm ci --only=production
   ```
5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
6. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
7. Start the application:
   ```bash
   pm2-runtime start src/app.js -i max
   ```

## Health Checks
- **Liveness**: Use `/health/liveness` for process restarts.
- **Readiness**: Use `/health/readiness` for traffic routing.

## Clustering
PM2 is configured to run in cluster mode (`-i max`), which will spawn a Node process for every available CPU core.

## Secrets
Provide environment variables via `.env` file or your platform's secret management system. Database credentials are managed through Supabase Dashboard.
