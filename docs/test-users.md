# Test Users

Run the seed script to create or update the following test users in your local DB:

```bash
pnpm db:seed-test-users
```

Users created:

- **admin@local.test** — role: **admin** — password: `adminpass`
- **owner@local.test** — role: **owner** — password: `ownerpass`
- **authority@local.test** — role: **authority** — password: `authoritypass`
- **user@local.test** — role: **user** — password: `userpass`

Notes:

- These are developer test accounts only. Do not use them in production.
- The script is idempotent and will update existing accounts.
