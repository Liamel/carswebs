# Astra Motors (Next.js + Drizzle + Auth.js)

Website for showcasing car inventory. Production-ready marketing site and in-app CMS admin panel for a car brand.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Neon Postgres via `DATABASE_URL`
- Drizzle ORM + SQL migrations
- Auth.js (`next-auth`) with Google OAuth
- Vercel-ready deployment

## Features

### Public site

- `/` Home page with CMS-driven hero/highlights and featured models
- `/models` Model listing with search + body type filters
- `/models/[slug]` Model detail page with specs and gallery placeholders
- `/book-test-drive` Booking flow with server-side validation + DB persistence
- `/book-test-drive/success` Success page
- `/about`, `/contact`

### Bookings

- Booking fields: name, email, phone, preferred model, preferred date/time, location, note
- Server-side Zod validation
- Booking status: `PENDING | CONFIRMED | CANCELLED`
- DB persistence in `bookings`
- Server-side `console.log("email sent", ...)` after create

### Admin CMS (`/admin`, protected)

- Google OAuth sign-in
- Email allowlist enforced via `ADMIN_EMAIL_ALLOWLIST`
- Server-side route protection (no client-only gating)
- Dashboard KPIs
- Cars CRUD
- Bookings list + status update
- Homepage content CMS (hero + highlights)

## Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and fill values:

```bash
cp .env.example .env.local
```

Required:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `ADMIN_EMAIL_ALLOWLIST` (comma-separated emails)

## Local setup

Install dependencies:

```bash
pnpm install
```

Generate migration SQL (already included, but available for future changes):

```bash
pnpm db:generate
```

Run migrations against Neon/Postgres:

```bash
pnpm db:migrate
```

Seed sample cars + homepage content:

```bash
pnpm db:seed
```

Run dev server:

```bash
pnpm dev
```

## Neon setup

1. Create a Neon project and database.
2. Copy the connection string into `DATABASE_URL`.
3. Ensure SSL is enabled (Neon connection strings include it by default).
4. Run `pnpm db:migrate` then `pnpm db:seed`.

## Google OAuth setup

1. Create a Google OAuth 2.0 Web application credential.
2. Add Authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-domain>/api/auth/callback/google`
3. Put client ID/secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
4. Set `NEXTAUTH_SECRET` (strong random value).
5. Put admin emails in `ADMIN_EMAIL_ALLOWLIST`.

## Drizzle files

- Schema: `lib/db/schema.ts`
- DB client: `lib/db/index.ts`
- Config: `drizzle.config.ts`
- Migrations: `drizzle/`
- Seed script: `scripts/seed.ts`

## Scripts

- `pnpm dev` – run app locally
- `pnpm build` – production build
- `pnpm lint` – ESLint
- `pnpm typecheck` – TypeScript checks
- `pnpm db:generate` – generate migration SQL
- `pnpm db:migrate` – apply migrations
- `pnpm db:studio` – open Drizzle Studio
- `pnpm db:seed` – seed data

## Vercel deploy notes

1. Push repository to Git provider.
2. Import project in Vercel.
3. Set all environment variables in Vercel Project Settings.
4. Deploy.
5. Run migrations/seed from CI or local machine against production DB before first use.

## Auth and admin behavior

- Non-allowlisted emails are denied at sign-in.
- Allowlisted emails are upserted into `users` with role `ADMIN`.
- `/admin/*` protected routes require valid session and allowlisted admin email.
