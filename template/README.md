# Starter template: Notes

A deliberately tiny app (sign in, write notes, delete notes) wired the way a real product should be. Copy patterns from it, or start your project from it.

Stack: Next.js 16 · Supabase (auth + Postgres) · Upstash Redis (rate limiting) · Sentry (errors) · Vercel (hosting). Every service has a free tier.

## Where each production concern lives

| Concern | File | What it does |
|---|---|---|
| Config fails fast | `src/lib/env.ts` | App refuses to start if a required setting is missing |
| Auth session | `src/proxy.ts`, `src/lib/supabase/proxy.ts` | Refreshes the session, blocks signed-out visitors from `/dashboard` |
| Verified identity | `src/lib/supabase/server.ts` → `getUserId()` | Uses `getClaims()`, which verifies the token. Never trusts raw cookies |
| Data access control | `supabase/migrations/*_create_notes.sql` | Row Level Security: each user can only touch their own rows |
| Input validation | `src/lib/validation.ts` | Every input checked on the server with zod |
| Rate limiting | `src/lib/ratelimit.ts` | Per-IP and per-user limits, stored in Redis, fails closed in production |
| Safe auth flow | `src/app/login/actions.ts`, `src/app/auth/confirm/route.ts` | Magic link, no email enumeration, no open redirect |
| Security headers | `next.config.ts` | CSP, HSTS, clickjacking and sniffing protection |
| Error tracking | `src/instrumentation.ts`, `src/instrumentation-client.ts`, `src/app/global-error.tsx` | Server and browser errors go to Sentry, without customer PII |
| Structured logs | `src/lib/log.ts` | One JSON line per event, searchable in your host's log viewer |
| Health check | `src/app/api/health/route.ts` | Endpoint for uptime monitors |
| Scalability basics | `dashboard/page.tsx`, migration | Bounded queries (`limit`), index matching the query |
| Tests | `src/lib/validation.test.ts` | Runs in CI on every push |

## Run it locally

You need Node.js 20.9 or newer.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/migrations/20261102000000_create_notes.sql`, and run it.
3. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/confirm` to Redirect URLs.
4. Copy the env file and fill in the Supabase values from **Project Settings → API**:
   ```bash
   cp .env.example .env.local
   ```
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Locally, rate limiting is skipped if Upstash isn't configured. In production it's required.

## Deploy it

1. Push to GitHub, then import the repo on [vercel.com](https://vercel.com).
2. Create a free Redis database at [upstash.com](https://upstash.com) and copy its REST URL and token.
3. Create a free Next.js project at [sentry.io](https://sentry.io) and copy its DSN.
4. In Vercel → Project → Settings → Environment Variables, add every variable from `.env.example` with production values. `NEXT_PUBLIC_SITE_URL` is your real domain.
5. In Supabase, update Site URL and Redirect URLs to your real domain.
6. Point a free uptime monitor (e.g. UptimeRobot or Better Stack free tier) at `https://your-domain/api/health`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run check` | Lint + typecheck + tests + build. Run before every push |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no output files |
| `npm test` | Unit tests |

## Adding a new table

Copy the pattern in the notes migration exactly: owner column, index for your main query, `enable row level security`, one policy per action, explicit grants. Then run the "Data access" prompt in [`../prompts/04-security-audit.md`](../prompts/04-security-audit.md) against it.
