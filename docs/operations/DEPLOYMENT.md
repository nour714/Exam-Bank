# Deployment Guide

## Production Environment
The application is containerized utilizing a multi-stage `Dockerfile`. The final production image is extremely lightweight (Alpine Linux) and only contains runtime dependencies.

## Building the Image
```bash
docker build --target production -t exambank-api:latest .
```

## Deployment via Docker Compose
For single-node VM deployments (e.g., AWS EC2, DigitalOcean Droplet):
1. Copy `docker-compose.yml`, `.env.example`, and the `scripts/` directory to the server.
2. Rename `.env.example` to `.env` and fill in secure production secrets (DO NOT commit this file).
3. Start the stack:
   ```bash
   docker-compose up -d
   ```

## Kubernetes Deployment Notes
- **Probes**: Use `/health/liveness` for container restarts and `/health/readiness` for traffic routing.
- **Clustering**: PM2 is configured to run in cluster mode (`-i max`), which will spawn a Node process for every available CPU core on the pod/container.
- **Secrets**: Provide `.env` variables via Kubernetes Secrets. 
- **Database**: Do NOT run the production PostgreSQL database in a standard pod without persistent volume claims. It is highly recommended to use managed databases (e.g., AWS RDS).
