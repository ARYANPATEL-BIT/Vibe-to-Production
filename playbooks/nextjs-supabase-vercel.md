# Playbook: Next.js + Supabase + Vercel

The guides in `docs/` are stack-agnostic. This playbook is the concrete version for the most common vibe-coding stack. The [`template/`](../template/) implements everything here.

Versions this was written against: Next.js 16, `@supabase/ssr` 0.12, `@supabase/supabase-js` 2.x. If your AI generates code that looks different from this, it may be using older patterns from its training data. Point it at this file.

---

## Free-tier reality check

| Service | What's free | What bites you |
|---|---|---|
| **Vercel Hobby** | Hosting, previews, HTTPS | **Non-commercial, personal use only** per Vercel's own terms. Charging customers means Vercel Pro, or a host whose free tier allows commercial use (read the terms; e.g. Cloudflare Workers via the OpenNext adapter). Runtime logs kept for 1 hour |
| **Supabase Free** | Postgres, auth, storage, 2 projects | Projects **pause after a week of inactivity**. 500 MB database. Daily backups are a paid-plan feature, so set up your own ([guardrails/backup workflow](../guardrails/README.md#optional-nightly-database-backup)). Built-in email sender is for testing only |
| **Upstash Redis** | Rate limiting | Request quota per month; fine for early stage |
| **Sentry Developer** | Error tracking, 1 user | Monthly event quota; sample traces (template uses 10%) |

Check each provider's pricing page before launch; limits change.

---

## Keys: which one goes where

| Key | Looks like | Where | Bypasses RLS? |
|---|---|---|---|
| Publishable key | `sb_publishable_…` (legacy: `anon`) | Browser and server, as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No |
| Secret key | `sb_secret_…` (legacy: `service_role`) | **Server only**, never prefixed `NEXT_PUBLIC_`. Only for webhooks, cron jobs, admin scripts | **Yes, completely** |

Rule of thumb: if code runs because a user clicked something, it uses the publishable key with the user's session, so RLS applies. The secret key is for code that runs without a user (webhooks, scheduled jobs).

Add `import "server-only";` (from the `server-only` npm package) at the top of any file that reads the secret key. If a client component ever imports it, the build fails instead of leaking the key.

---

## Auth: the patterns that matter

**1. Verify, don't read.** On the server, `supabase.auth.getClaims()` verifies the token. `getSession()` just reads the cookie, which anyone can forge. Never use `getSession()` for access decisions on the server.

**2. The proxy refreshes sessions.** In Next.js 16 the file is `src/proxy.ts` exporting `proxy()`. On Next.js 15 and earlier it's `middleware.ts` exporting `middleware()`. If your AI writes the wrong one for your version, sessions silently stop refreshing and users get randomly signed out.

**3. One server client per request.** Never store a Supabase server client in a module-level variable. Create it inside the function handling the request (template: `createClient()` in `src/lib/supabase/server.ts`).

**4. Refresh in one place.** Refresh tokens are single-use. Refreshing in both the proxy and elsewhere causes random sign-outs.

**5. Don't let CDNs cache auth responses.** The proxy copies Supabase's `Cache-Control` headers onto the response (template does this in `setAll`). Without it, a CDN could serve one user's session cookie to another.

**6. Check auth where the data is read.** The proxy redirecting signed-out users is a convenience. The page or action that reads data checks again (template: `getUserId()` at the top of every action and protected page).

**7. Auth settings in the dashboard:**
- Authentication → URL Configuration: set Site URL and an exact list of Redirect URLs. No wildcards on production.
- Set up custom SMTP (Resend, Postmark, SES…) before launch.
- Turn on leaked-password protection if you use passwords, and CAPTCHA protection once bots arrive.

---

## Server actions are public API endpoints

Every exported function in a `"use server"` file becomes an endpoint anyone can call with any arguments, even if no page uses it.

- Only export real actions from `"use server"` files. Put helpers in normal files.
- Every action: get the user → check permission → rate limit → validate with zod → do the work. See [`template/src/app/dashboard/actions.ts`](../template/src/app/dashboard/actions.ts).
- Arguments are untrusted even when your own form sends them. A hidden `<input name="id">` can be changed by the user.

---

## Database

- Create every change as a migration: `npx supabase migration new add_projects`, write SQL, `npx supabase db push`. Commit the file. Don't click-edit tables in production.
- Every table: owner column, index on it, `enable row level security`, one policy per action, `with check` on insert/update. Pattern in [03 Data access](../docs/03-data-access.md).
- Run **Advisors** in the Supabase dashboard (Security and Performance) after every schema change. They flag tables without RLS, risky functions and missing indexes.
- Views: create with `with (security_invoker = true)` or they ignore RLS.
- Need a function that touches multiple tables atomically (e.g. "deduct credits and create order")? Write a Postgres function and call it with `supabase.rpc()`, so it runs as one transaction.
- Connecting with Prisma/Drizzle instead of the JS client? Use the pooler connection string.

## Storage

- Buckets private by default. Policies on `storage.objects` that scope by folder, e.g. files under `{user_id}/…` only readable by that user.
- Serve files with `createSignedUrl()` (short expiry), not public URLs.
- Set allowed MIME types and max file size on the bucket itself.

---

## Vercel

- **Environment scopes:** Vercel has Production, Preview and Development env scopes. Point Preview at a **separate** Supabase project, never production data.
- **Deployment Protection:** keep previews behind Vercel Authentication so random people can't use half-finished features against real services.
- **Function region:** set it close to your Supabase region (Project Settings → Functions). A function in the US talking to a database in Mumbai adds latency to every query.
- **Rollback:** Deployments → last good deployment → Instant Rollback. Try it once before you need it.
- **Spend:** if you upgrade to Pro, set Spend Management limits.

---

## Things AI gets wrong in this stack

| AI writes | Problem | Correct |
|---|---|---|
| `getSession()` in server code | Trusts a forgeable cookie | `getClaims()` |
| `middleware.ts` on Next.js 16 | Never runs; sessions don't refresh | `proxy.ts` with `export async function proxy` |
| `@supabase/auth-helpers-nextjs` | Deprecated package | `@supabase/ssr` |
| `SUPABASE_SERVICE_ROLE_KEY` in a server action handling user input | Bypasses RLS for every request | User-scoped client with publishable key |
| `NEXT_PUBLIC_` on a secret | Ships it to every browser | No prefix, server-only file |
| `create table` without RLS | Table readable by anyone | Always `enable row level security` + policies |
| `using (true)` policy | Same as no RLS | Real ownership check |
| Fetching all rows then `.filter()` in JS | Slow, leaks data to the server unnecessarily | Filter and `limit` in the query |
| `redirect(searchParams.get("next"))` | Open redirect | Fixed paths or validated relative path |
| Caching a page that shows user data | One user sees another's data | Personal pages are dynamic; only cache public ones |
