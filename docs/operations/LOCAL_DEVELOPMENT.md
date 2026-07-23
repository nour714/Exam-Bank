# Local Development Guide

## Prerequisites
- Node.js (v20+)
- Supabase project (for PostgreSQL database)
- Redis (v7+)
- Git

## Initial Setup
1. **Clone the repository.**
2. **Environment Variables**: Copy `.env.example` to `.env`.
3. **Database**: Set `DATABASE_URL` to your Supabase connection string (found in Supabase Dashboard → Settings → Database → Connection string).
4. **Install Dependencies**:
   ```bash
   npm install
   ```

## Running the Application
1. Ensure Redis is running locally.
2. Generate Prisma client: `npx prisma generate`
3. Run DB Migrations: `npx prisma migrate dev`
4. Start Node: `npm run dev`

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
