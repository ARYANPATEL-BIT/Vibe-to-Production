# 02 · Security

The mental model: **the browser belongs to the attacker.** Anything in your frontend code, anything the browser sends, any check that runs in the browser can be read, changed or skipped by anyone with dev tools. Security only exists on the server and in the database.

Each section ends with a test you can run yourself without being a developer.

---

## 1. Secrets

A secret is anything that grants power: database admin keys, Stripe secret keys, AI API keys, email provider keys, webhook signing secrets.

**Rules**

- Secrets live in environment variables, set in your host's dashboard (Vercel, Netlify, Railway…) and in a local `.env.local` file that is **never committed**.
- Only `.env.example` (with fake values) goes in git.
- **Anything prefixed `NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_` or `PUBLIC_` is shipped to every visitor's browser.** Only put values there that are designed to be public (e.g. Supabase publishable key, Stripe publishable key, Sentry DSN).
- Secret keys are only used in server code: API routes, server actions, backend functions.
- Different keys for development and production. Never use live keys locally.
- If a secret is ever committed, even for one minute, even in a private repo: **rotate it** (generate a new one in the provider's dashboard and delete the old one). Deleting the commit is not enough; git history and bots have already copied it.

**The guardrails catch:** commits containing known secret formats, committed `.env` files, and live secrets anywhere in git history (see [guardrails](../guardrails/README.md)).

**Test it yourself:** Open your deployed site → right-click → Inspect → Sources tab. Press Ctrl/Cmd+Shift+F and search for `sk_`, `secret`, `service_role`, `sb_secret`, `api_key`, `password`. You should find nothing sensitive.

---

## 2. Authentication (who are you?)

**Rules**

- **Never build your own auth.** Use Supabase Auth, Clerk, Auth.js, Firebase Auth or similar. They handle password hashing, session tokens, email verification and brute-force protection.
- Prefer magic links, passkeys or "Sign in with Google" over passwords. No password = no password to leak.
- On the server, verify the session with the provider's verification function every time. In Supabase that's `getClaims()` or `getUser()`, never `getSession()` (which reads the cookie without verifying it).
- Login and signup errors must not reveal whether an account exists. "If that email is registered, we've sent a link" — not "No account with that email".
- Turn on multi-factor authentication for every admin account, and for your own accounts on GitHub, your host, your database provider, your domain registrar and your payment provider. Those accounts are your production.

**Test it yourself:** Try signing in with an email that doesn't exist. The message should look identical to the one for a real account.

---

## 3. Authorization (are you allowed?)

This is where most vibe-coded apps fail, and it gets its own guide: **[03 Data access](03-data-access.md)**.

The short version: being signed in is not permission. Every read and write must check that *this* user is allowed to touch *this* record, and that check must happen in the database or on the server.

---

## 4. Every server endpoint is public

API routes, server actions, edge functions, webhooks: each one is a URL anyone on the internet can call directly, with any data they like, without using your UI.

Hiding a button doesn't protect the action behind it. If an admin-only "Delete user" button is hidden for normal users but the server action doesn't check for admin, any user can call it.

**Every endpoint must, in this order:**

1. **Authenticate:** who is calling? (Reject if nobody and the endpoint needs a user.)
2. **Authorize:** is this caller allowed to do this to this specific record?
3. **Rate limit:** has this caller done this too many times recently?
4. **Validate:** is the input the right shape, type and size? Use a schema library (zod, valibot) and reject anything else.
5. Only then: do the work.

The template's [`dashboard/actions.ts`](../template/src/app/dashboard/actions.ts) shows this order.

**Test it yourself:** Ask your AI: *"List every API route, server action, edge function and webhook in this project. For each, show me the exact lines that do authentication, authorization, rate limiting and validation. Mark any that are missing."*

---

## 5. Input validation and injection

Anything that comes from outside (form fields, URL parameters, headers, uploaded files, webhook bodies, even AI model output) is untrusted.

| Attack | What it looks like | Defense |
|---|---|---|
| **SQL injection** | User types `'; DROP TABLE users; --` into a search box | Use the database client's query builder or parameterized queries. Never build SQL by gluing strings together |
| **XSS (cross-site scripting)** | User's "bio" contains `<script>` that runs in other users' browsers and steals their sessions | Let React/Vue/Svelte render text normally. Never use `dangerouslySetInnerHTML`, `v-html` or `innerHTML` on user content. If you must render user HTML or Markdown, sanitize it with DOMPurify |
| **Open redirect** | `yoursite.com/login?next=https://evil.com` sends users to a phishing page after login | Only redirect to fixed paths, or check that `next` starts with `/` and not `//` |
| **SSRF** | User submits a URL for your server to fetch, and points it at internal services | If you fetch user-supplied URLs, allow only `https:` and block private IP ranges, or use an allowlist of domains |
| **Mass assignment** | User adds `"role": "admin"` to a profile update request | Validate with a schema that lists only the fields a user may change. Never pass the whole request body to the database |

---

## 6. Rate limiting and abuse

Without rate limits, one script can sign up 10,000 fake accounts, send 10,000 emails from your domain (ruining your email reputation), or call your AI endpoint until your bill hits five figures.

**Rules**

- Rate-limit: login, signup, password reset, magic links, contact forms, anything that sends email/SMS, anything that calls a paid API, file uploads, and search.
- Limit by user ID when signed in, by IP address when not. For email-sending actions, also limit by the target email address.
- Store counters in a shared store like Redis (Upstash has a free tier). **In-memory rate limiting does nothing on serverless hosts**, because each request may run on a fresh instance.
- If the rate limiter isn't configured in production, fail closed (block), not open.
- Set hard spending caps in every paid provider's dashboard (OpenAI, Anthropic, Twilio, your cloud host). This is your last line of defense.
- Add a CAPTCHA (Cloudflare Turnstile is free) to signup and contact forms once bots find you.

**Test it yourself:** Submit your login form 15 times quickly. You should get a "too many attempts" message.

---

## 7. File uploads

- Check file type by content on the server, not by the extension or the browser's claim.
- Set a maximum size.
- Store uploads in object storage (Supabase Storage, S3, Cloudflare R2), never on your server's disk.
- Make buckets **private by default**, and give out short-lived signed URLs to people who are allowed to see the file.
- Rename files on upload (e.g. random ID). Never use the user's filename as a path.
- Never serve user-uploaded HTML or SVG from your main domain; they can carry scripts.

---

## 8. Security headers

Headers tell the browser to block whole categories of attacks. Set them once in your framework config (the template does this in [`next.config.ts`](../template/next.config.ts)):

| Header | Blocks |
|---|---|
| `Content-Security-Policy` | Injected scripts loading from other sites; your site being framed |
| `Strict-Transport-Security` | Downgrade to plain HTTP |
| `X-Frame-Options: DENY` | Clickjacking (your site hidden inside another site's frame) |
| `X-Content-Type-Options: nosniff` | Browser guessing file types and executing uploads as scripts |
| `Referrer-Policy` | Leaking full URLs (with tokens) to other sites |
| `Permissions-Policy` | Unused camera, microphone and location access |

The template's CSP allows inline scripts because Next.js needs them unless you use per-request nonces. A nonce-based CSP is stronger; switch when you're comfortable (search the Next.js docs for "Content Security Policy nonce").

**Test it yourself:** Enter your URL at [securityheaders.com](https://securityheaders.com). Aim for an A.

---

## 9. CORS

CORS controls which other websites may call your API from a browser. AI tools often "fix" a CORS error by allowing `*` (everyone). That's usually fine for a public read-only API and dangerous for anything using cookies or auth. If your frontend and API are on the same domain, you don't need CORS at all. Otherwise, list your exact frontend domains.

---

## 10. Dependencies and supply chain

Every package you install is code from a stranger running with full access to your app.

- **AI models invent package names.** Attackers register those invented names with malware inside ("slopsquatting"). Before installing any package the AI suggests, check it exists on npm/PyPI, has real weekly downloads, a real repository, and has been around for a while.
- Prefer fewer, well-known packages. A 10-line function you understand beats a dependency you don't.
- Commit your lockfile (`package-lock.json`, `pnpm-lock.yaml`…) so every install gets the exact same versions.
- Run `npm audit` (or equivalent) in CI and let Dependabot open update PRs. The guardrails do both.
- In CI, pin third-party GitHub Actions to a version tag, never `@main`.

---

## 11. AI features in your app

If your product itself calls an AI model, add these:

- **Prompt injection is not solvable by prompting.** Any text the model reads (user messages, uploaded docs, web pages, emails) can contain instructions that hijack it. Design so a hijacked model can't do damage: it only gets the permissions of the user it's acting for, and it can't trigger irreversible actions (sending money, deleting data, emailing people) without a confirmation step.
- **Model output is untrusted input.** Validate it before using it in a database query, a redirect, HTML or a shell command.
- Never put secrets, other users' data, or internal system details in prompts.
- Per-user rate limits and a per-user daily budget on AI calls, plus a hard cap in the provider dashboard.
- Log prompts and responses carefully: they often contain personal data. Redact or don't store them.

---

## 12. Error messages and logs

- Customers see friendly, generic errors. "Something went wrong, please try again."
- Full errors go to your error tracker (Sentry) and logs, never to the browser. Stack traces in API responses reveal your file structure, libraries and sometimes queries.
- Never log passwords, tokens, full card numbers, or entire request bodies.

---

## Done when

- [ ] No secrets in frontend code, git history, or chat logs; live and test keys separated
- [ ] Managed auth; server verifies sessions with the provider's verify function
- [ ] Every endpoint authenticates, authorizes, rate-limits and validates, in that order
- [ ] No raw HTML rendering of user content; no string-built SQL; no open redirects
- [ ] Rate limits on auth, email, paid APIs, uploads; spending caps set in every provider
- [ ] Uploads private, size-limited, type-checked, renamed
- [ ] Security headers score A on securityheaders.com
- [ ] Every dependency is real, popular, and audited in CI
- [ ] MFA on every account that can touch production
- [ ] [`prompts/04-security-audit.md`](../prompts/04-security-audit.md) run in a fresh session with no high-severity findings left
