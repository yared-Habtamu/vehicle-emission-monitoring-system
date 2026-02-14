VEM

## Backend & Database (local)

This project now includes a lightweight backend using Prisma. For local development you can use SQLite or connect to a remote Postgres (Supabase).

1. Copy `.env.example` to `.env` and fill values. If you are using Supabase, set the following essential variables:

   - `NEXT_PUBLIC_SUPABASE_URL` (public client URL, used in browser)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public anon key for client)
   - `SUPABASE_KEY` (service role key, server-only)
   - `DATABASE_URL` (Postgres connection string; can point to Supabase Postgres)
   - `JWT_SECRET` (secret used to sign tokens)

2. Install dependencies: `pnpm install` (this will include Prisma and @prisma/client).
3. Generate Prisma client: `pnpm prisma:generate`
4. Run migrations (creates or updates database schema): `pnpm prisma:migrate:dev`
5. Start the dev server: `pnpm dev`

API endpoints provided (under `/app/api`):

- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login and receive JWT
- `GET/POST /api/vehicles` - list and create vehicles
- `GET/PUT/DELETE /api/vehicles/:id` - manage vehicle
- `POST /api/vehicles/:id/emissions` - ingest emission reading
- `GET/POST /api/reports` - list and create reports
- `GET /api/analytics/summary` - emission trend & summary
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser access.
- Set `SUPABASE_KEY` (service role key) for server-side operations.

Security note: `.env.example` includes a generated `JWT_SECRET` for convenience — replace it with a secure value in production and never commit real secrets to the repository.

possible to use MongoDB too.
