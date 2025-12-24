Manual migration SQL for initializing database schema

How to apply:

1. Open your Supabase project dashboard -> SQL Editor.
2. Create a new query and paste the contents of `migration.sql`.
3. Run the query to create tables, indexes, and foreign keys.

Notes:
- This migration was generated locally using `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`.
- Take a backup or snapshot of your Supabase database before applying if it contains important data.
- After applying, you can run `prisma generate` locally and continue development. If DNS/network issues are resolved, I can attempt to run `prisma migrate dev` directly from here.
