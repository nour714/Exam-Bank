#!/bin/sh
set -e

echo "[Prod-Startup] Waiting for PostgreSQL..."
# (Assuming postgres is ready via depends_on in docker-compose, 
# but could add a pg_isready loop here for Kubernetes)

echo "[Prod-Startup] Running Database Migrations..."
npx prisma migrate deploy

echo "[Prod-Startup] Starting Node.js Cluster via PM2..."
exec pm2-runtime start src/app.js -i max
