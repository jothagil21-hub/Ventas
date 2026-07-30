# Deploy docs (Vercel)

## Build Command

In Vercel project settings, use:

```
npm run vercel-build
```

That runs `prisma migrate deploy && prisma generate && next build`.

## Environment variables

- `DATABASE_URL` — PostgreSQL connection string (`postgres://...` or `postgresql://...`)
- `AUTH_SECRET` — long random secret
- `AUTH_URL` — public app URL (`https://your-app.vercel.app`)

## Temporary Prisma Postgres

If you used `npx create-db`, claim the database before it expires so it becomes permanent:

Open the `CLAIM_URL` from your `.env` in the browser and follow the claim flow.
