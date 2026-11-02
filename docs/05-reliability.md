# 05 · Reliability

Things will break: a provider has an outage, a deploy has a bug, a migration goes wrong, a webhook arrives twice. Reliability isn't preventing every failure. It's making sure failures are small, visible and recoverable.

## 1. Backups you've actually restored

A backup you've never restored is a hope, not a backup.

- Know your database provider's backup policy. Free tiers often have limited or no point-in-time recovery. **Check yours today.**
- If your plan has no automatic backups, schedule your own: a nightly `pg_dump` from a GitHub Actions cron job to private storage is free.
- **Restore a backup into a scratch project once**, before launch, and confirm the data is there. Write down the steps.
- Uploaded files need backups too, not just the database.

## 2. Database changes go through migrations

- Every schema change is a migration file in git (`supabase/migrations/…sql`, Prisma migrations, etc.). **Never click-edit the production schema in a dashboard.** You lose the record of what changed and can't recreate the database.
- Before running a migration in production: run it against staging, and take a backup.
- Dangerous operations (dropping columns or tables, renaming columns, changing types) are done in steps: add the new thing → deploy code that uses both → migrate data → deploy code that uses only the new thing → remove the old thing.
- AI agents sometimes "fix" a migration error by dropping and recreating a table. Read every migration before running it. Look for `drop`, `truncate`, and `delete` without `where`.

## 3. Environments

| Environment | Purpose | Data |
|---|---|---|
| Local | You and the AI build here | Fake seed data |
| Preview/staging | Test a change before it's live | Fake or anonymized data, separate database |
| Production | Customers | Real data |

- Production has its own database, its own keys, and its own accounts. Never point local or preview at the production database.
- Most hosts (Vercel, Netlify, Cloudflare) create a preview deployment for every pull request for free. Use them: click through the change there before merging.

## 4. Safe deploys and rollbacks

- Deploy small changes often, not big ones rarely. Smaller change = easier to find what broke.
- Know how to roll back **before** you need to. On Vercel: Deployments → pick the last good one → Promote/Instant Rollback. Practice it once.
- Code rollback doesn't undo database migrations. Make migrations backwards-compatible so old code still works with the new schema.
- Don't deploy right before you go to sleep or on a Friday evening if nobody can watch it.

## 5. Handle errors on purpose

- Every external call can fail: databases, payment APIs, AI APIs, email. Decide what the user sees when it does. "Couldn't save, please try again" beats a blank screen.
- Show error states in the UI for every data load and every form submit.
- Add an error boundary / global error page so a crash in one component doesn't white-screen the app (the template has [`global-error.tsx`](../template/src/app/global-error.tsx)).
- Set timeouts on outbound calls. Retry only things that are safe to retry, with a growing delay between attempts.

## 6. Idempotency: doing it twice must be safe

Networks retry. Users double-click. Webhooks get delivered more than once (payment providers say so explicitly). If "charge the customer", "grant credits" or "send the welcome email" runs twice, you have a real problem.

- Disable submit buttons while a request is in flight.
- For webhooks, store the event ID and skip events you've already processed (see [07 Payments](07-payments.md)).
- Use database unique constraints to make duplicates impossible, not just unlikely.

## 7. Depend on fewer things

Each third-party service is another thing that can go down. For each one in your `SPEC.md`, write down what your app does when it's unavailable. Core flows (sign in, see your data) should not depend on non-essential services (analytics, chat widgets, AI features).

## Done when

- [ ] Backups exist for database and files, and you've restored one successfully
- [ ] All schema changes are migrations in git; nothing edited by hand in production
- [ ] Separate local, preview and production environments, with separate databases and keys
- [ ] You've practiced a rollback
- [ ] Every data load and form has an error state; there's a global error page
- [ ] Payment, credit and email actions are idempotent
- [ ] Each outside service has a "what if it's down?" answer
