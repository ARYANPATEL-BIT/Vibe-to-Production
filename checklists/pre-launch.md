# Pre-launch checklist

Go through this before real users or real money touch your app. Copy it into an issue or your notes and tick items off.

**🛑 Blocker:** do not launch without it. **⚠️ Should:** fix within the first weeks. Each section links to the guide that explains why.

You can also have the AI check most of this for you with [`prompts/05-launch.md`](../prompts/05-launch.md), but tick the 👤 items yourself: they need a human.

---

## Secrets — [guide](../docs/02-security.md#1-secrets)

- [ ] 🛑 No secret keys in frontend code (searched browser Sources for `sk_`, `secret`, `service_role`, `sb_secret`, `api_key`) 👤
- [ ] 🛑 `.env` files are gitignored; secret scan of full git history is clean (CI security workflow green)
- [ ] 🛑 Any key that was ever committed or pasted somewhere public has been rotated
- [ ] 🛑 Production uses live keys; local and preview use test keys
- [ ] 🛑 MFA on GitHub, hosting, database, domain registrar, payment and email provider accounts 👤

## Auth and data access — [guide](../docs/03-data-access.md)

- [ ] 🛑 Managed auth provider; server verifies sessions with the provider's verify function
- [ ] 🛑 Every table with user data has RLS/security rules with explicit per-action policies
- [ ] 🛑 Update policies have `with check`; users can't change their own role, plan, credits or owner fields
- [ ] 🛑 Secret/service key never used for normal user requests
- [ ] 🛑 Two-account test passed for every data type, including direct API calls 👤
- [ ] 🛑 Storage buckets are private with per-user policies
- [ ] ⚠️ Login errors don't reveal whether an account exists

## Endpoints — [guide](../docs/02-security.md#4-every-server-endpoint-is-public)

- [ ] 🛑 Every API route / server action / function authenticates, authorizes, rate-limits and validates input
- [ ] 🛑 Rate limits on login, signup, password reset, email/SMS sending and every paid API call
- [ ] 🛑 Spending caps set in every paid provider (AI, SMS, cloud) 👤
- [ ] 🛑 No `dangerouslySetInnerHTML`/`innerHTML` on user content without sanitizing; no SQL built from strings
- [ ] ⚠️ Security headers score A on securityheaders.com 👤
- [ ] ⚠️ CAPTCHA (e.g. Cloudflare Turnstile) on signup and contact forms

## Payments — [guide](../docs/07-payments.md)

- [ ] 🛑 Prices decided server-side; access granted only by verified webhooks
- [ ] 🛑 Webhook handler idempotent (event IDs stored with unique constraint)
- [ ] 🛑 Entitlements table writable only by the server
- [ ] 🛑 One real live-mode purchase + refund tested end to end 👤
- [ ] ⚠️ Failed payment, cancellation, refund and dispute paths handled
- [ ] ⚠️ Self-serve cancel and update card

## Reliability — [guide](../docs/05-reliability.md)

- [ ] 🛑 Database backups exist and one restore has been tested 👤
- [ ] 🛑 Production has its own database and keys, separate from local and preview
- [ ] 🛑 All schema changes are migrations in git
- [ ] ⚠️ You've practiced a rollback 👤
- [ ] ⚠️ Every page and form has an error state; global error page exists

## Scalability — [guide](../docs/04-scalability.md)

- [ ] 🛑 Every list query has a limit/pagination
- [ ] ⚠️ Indexes on every common filter/sort column and foreign key
- [ ] ⚠️ No queries inside loops; slow work moved to background jobs or has timeouts
- [ ] ⚠️ Cost per active user known; budget alerts on 👤

## Observability — [guide](../docs/06-observability.md)

- [ ] 🛑 Error tracking on server and browser, alerting you on new errors
- [ ] 🛑 Uptime monitor on the site and health endpoint, alerting your phone 👤
- [ ] ⚠️ Structured logs with IDs and no secrets
- [ ] ⚠️ Key product events tracked (signup, activation, payment)

## Legal — [guide](../docs/08-legal-and-privacy.md)

- [ ] 🛑 Accurate privacy policy listing every processor 👤
- [ ] 🛑 Terms of service and refund policy linked in footer and at checkout 👤
- [ ] 🛑 Hosting plan allows commercial use 👤
- [ ] ⚠️ Account deletion and data export work
- [ ] ⚠️ Cookie consent if using non-essential trackers
- [ ] ⚠️ Marketing emails have one-click unsubscribe

## Customer experience — [guide](../docs/10-customer-ready.md)

- [ ] 🛑 Emails sent from your domain via a real provider, with SPF/DKIM/DMARC 👤
- [ ] 🛑 Visible support contact
- [ ] ⚠️ Loading, empty, error and success states everywhere
- [ ] ⚠️ Works at 375px width; keyboard-navigable; axe DevTools clean 👤
- [ ] ⚠️ Custom domain, favicon, share image, 404 page

## Guardrails — [guide](../guardrails/README.md)

- [ ] 🛑 CI (lint, typecheck, tests, build, audit) green on main
- [ ] 🛑 Security workflow (secret scan, static analysis) green
- [ ] ⚠️ Pre-commit hooks installed; Dependabot enabled
- [ ] ⚠️ Branch protection on main: require checks to pass before merging 👤

## Final pass

- [ ] 🛑 [`prompts/04-security-audit.md`](../prompts/04-security-audit.md) run in a **fresh** AI session; all critical/high findings fixed
- [ ] 🛑 You can explain, in plain words, how a user's data is protected 👤
