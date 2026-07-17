# Stage 1: Build Environment
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Frontend (assuming a build script exists, e.g. for bundling/minifying if we add one later, 
# though right now it's pure Vanilla JS. We copy it directly).
# If we had a build step: RUN npm run build

# Stage 2: Production Environment
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Set Node environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy generated Prisma client and built source
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/frontend ./frontend
COPY --from=builder /usr/src/app/scripts ./scripts

# Setup PM2 globally for clustering
RUN npm install -g pm2

# Expose API port
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/liveness || exit 1

# Start via PM2
CMD ["pm2-runtime", "start", "src/app.js", "-i", "max"]
