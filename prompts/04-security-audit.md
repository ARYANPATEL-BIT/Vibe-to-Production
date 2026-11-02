# 04 · Security audit

Use before launch, before you start taking payments, after any big feature, and monthly. Always in a **fresh** session. This takes the agent a while; that's expected.

```text
You are a security auditor doing a pre-launch review of this entire codebase. Assume an attacker who is a signed-up user with browser dev tools and curl, and who can read all frontend code. Read AGENTS.md and SPEC.md first.

Work through each section. For each finding, cite file:line, give severity (critical/high/medium/low), show how an attacker would exploit it in 1-3 concrete steps, and give the fix. Don't edit files.

1. Secrets
   - Search the code, config and git history for API keys, tokens, passwords, private keys, connection strings.
   - List every env var and whether it reaches the browser. Flag any secret that does.
   - Is .env* gitignored (except .env.example)?

2. Inventory
   - List every API route, server action, edge/cloud function, webhook and cron job, as a table: path/name, who should be able to call it, authentication (yes/no + line), authorization (yes/no + line), rate limit (yes/no), input validation (yes/no).

3. Data access
   - List every table/collection and storage bucket. For each: is RLS/security-rule protection enabled? Paste each policy and explain in plain words who it lets do what.
   - Flag: missing RLS, `using (true)`, update policies without `with check`, user-writable role/plan/credits/owner columns, views without security_invoker, security definer functions, public buckets.
   - Find every use of the service/secret/admin key and confirm none handles a normal user request.
   - Find every query or lookup by ID and confirm it's scoped to the current user or protected by RLS (IDOR check).

4. Authentication
   - Server-side session verification uses the provider's verify function (not getSession or equivalent)?
   - Do login/reset flows reveal whether an account exists?
   - Any redirect that uses a user-supplied URL?

5. Injection and output
   - String-built SQL, raw HTML rendering of user content, server fetches of user-supplied URLs, shell commands with user input, file paths built from user input.

6. Abuse and cost
   - Which endpoints send email/SMS, call paid APIs, or do heavy work? Are they rate-limited per user/IP, and does the limiter fail closed in production?
   - For AI features: can user-controlled text hijack the model into actions with consequences? Is model output validated?

7. Payments (if any)
   - Prices server-side? Webhook signature verified on the raw body? Idempotent? Entitlements writable only by the server? Is access ever granted from the success redirect?

8. Uploads (if any)
   - Type checked by content, size capped, private storage, renamed, signed URLs?

9. Headers and config
   - CSP, HSTS, X-Frame-Options/frame-ancestors, nosniff, Referrer-Policy present? CORS overly broad? Debug mode or verbose errors in production?

10. Dependencies
   - Run the package manager's audit. List high/critical vulnerabilities and whether they're reachable. Flag any dependency that looks abandoned, obscure or unnecessary.

Finish with:
- A table of all findings sorted by severity.
- The 3 things to fix first.
- A list of things you could NOT check from code alone (dashboard settings, provider config, backups, MFA) that I must check myself.
```

**After:** fix critical and high findings one at a time with [02-build.md](02-build.md), then run this audit again in another fresh session until none remain. Do the [two-account test](../docs/03-data-access.md#the-two-account-test-do-this-before-every-launch) yourself; no AI can fully replace it.
