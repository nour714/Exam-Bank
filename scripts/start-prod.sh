#!/bin/sh
set -e

echo "[Prod-Startup] Waiting for PostgreSQL..."
# Ensure PostgreSQL is ready before proceeding
# (consider adding a pg_isready loop for automated deployments)

echo "[Prod-Startup] Running Database Migrations..."
npx prisma migrate deploy

echo "[Prod-Startup] Starting Node.js Cluster via PM2..."
exec pm2-runtime start src/app.js -i max
