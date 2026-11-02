# Rules for AI coding agents

These rules apply to every change in this project. They exist because the person you're working with may not be a professional developer and is relying on you to build something safe to put in front of paying customers. "It works on my machine" is not the goal. Production-ready is.

If a rule here conflicts with a request, follow the rule and explain the conflict in plain language. If the user explicitly confirms they want to break a rule, do it and add a `// RISK:` comment explaining what was given up.

## Before you write code

- Read `SPEC.md` if it exists. It defines users, roles, data, who can access what, and what's out of scope.
- For anything bigger than a small fix, first reply with a short plan: files you'll change, data you'll touch, and any security, cost or data-loss risk. Wait for approval.
- Work in small steps. One feature or fix per change. If a task needs more than ~300 changed lines, split it and say so.
- Explain decisions in plain language. Avoid jargon or define it.

## Security: non-negotiable

1. **Secrets** stay in environment variables, only used in server-side code. Never hardcode a key, token or password. Never put a secret in a variable prefixed `NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_` or `PUBLIC_`. When adding a new env var, add it to `.env.example` with a placeholder value.
2. **Every server endpoint** (API route, server action, edge/cloud function) does these in order: authenticate the caller → authorize this caller for this specific record → rate limit → validate input with a schema (zod or equivalent) → do the work. No exceptions for "internal" endpoints; they are all public URLs.
3. **Authorization is enforced on the server and in the database**, never only in the UI. Hidden buttons are not access control.
4. **Every database table holding user data** gets Row Level Security (or the platform's equivalent rules) enabled with explicit policies for each action, in the same migration that creates the table. Update policies always include `with check`. Never write `using (true)` for user data.
5. Users must never be able to change their own role, plan, credits, balance, or the owner of a record.
6. **Never use an admin/service/secret database key** to handle a normal user request. It bypasses all access rules. It's only for webhooks, scheduled jobs and admin scripts.
7. **Verify sessions** with the auth provider's verification call on the server (Supabase: `getClaims()` or `getUser()`, never `getSession()`).
8. **No injection:** use the query builder or parameterized queries, never string-built SQL. Never render user content with `dangerouslySetInnerHTML`, `v-html` or `innerHTML` unless sanitized with DOMPurify. Never redirect to a URL taken from user input.
9. **Rate limit** login, signup, password reset, anything that sends email/SMS, anything that calls a paid API, uploads and search. Use a shared store (e.g. Redis), never in-memory counters on serverless.
10. **Uploads:** check type by content, cap size, store in private object storage, rename files, serve via short-lived signed URLs.
11. **Payments:** prices come from server-side IDs, never from the client. Access is granted only by verified, idempotent webhooks, never by the success page.
12. **Errors** shown to users are generic and friendly. Full details go to logs/error tracking. Never return stack traces or raw database errors to the client.
13. **Logs** never contain passwords, tokens, API keys, full card numbers or entire request bodies.
14. **AI features** treat model output as untrusted input, never put secrets or other users' data in prompts, and have per-user rate limits and spend limits.

## Dependencies

- Prefer the standard library and packages already in the project. Don't add a dependency for something achievable in a few lines.
- Before adding any package, confirm it exists, is widely used and actively maintained. Tell the user its name and why it's needed. Never invent package names.
- Never pin GitHub Actions to `@main` or `@master`; use a version tag.

## Database

- Every schema change is a new migration file. Never edit an applied migration. Never tell the user to change production by hand in a dashboard.
- Never write `drop`, `truncate`, or `delete` without `where` in a migration without stopping first to explain exactly what data will be lost and getting explicit confirmation.
- Add an index for every column used to filter, sort or join in common queries, including foreign keys.
- Every list query has a `limit`. Select only needed columns. Never query inside a loop.

## Reliability and scale

- Every external call (database, payments, AI, email, third-party APIs) has error handling and a timeout. Decide what the user sees when it fails.
- Every page and form has loading, empty, error and success states.
- Slow or retry-able work (email, AI calls, image processing, long API calls) goes in a background job, not in the request.
- Operations involving money, credits or sending messages must be safe to run twice (idempotent).

## Tests

- Never modify, skip, weaken or delete an existing test to make it pass. If a test fails, fix the code. If you believe the test itself is wrong, stop and explain why before touching it.
- Never write assertions that can't fail (`expect(true)`, `toBeDefined()` as the only check). Don't mock the thing under test.
- When fixing a bug, first add a test that reproduces it.
- Add tests for any permission, money, or entitlement logic you write.

## Destructive or irreversible actions: ask first

Stop and get explicit confirmation before: deleting files or data, running migrations against any non-local database, changing auth or payment configuration, force-pushing, changing CI or security settings, rotating or removing keys, or anything touching production.

Don't commit or push unless the user asks.

## Definition of done

A change is done only when:

1. Lint, typecheck, tests and build pass (`npm run check` or the project's equivalent). Run them; don't assume.
2. You've re-read your own diff for the security rules above.
3. Your final message states, in plain language:
   - What changed and why
   - Any security-relevant change (new endpoint, new table, new policy, new env var, new dependency, new third-party data flow)
   - What you did **not** verify, and how the user can verify it (e.g. "try this with two accounts")
   - Any new env var the user must set in their hosting dashboard

Never claim something works if you didn't run it.
