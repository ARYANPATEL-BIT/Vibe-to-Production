# vibe-to-prod

**Vibe code it. Ship it like a professional.**

AI can build your app in a weekend. It won't, by default, make it safe to put in front of paying customers. This repo is the missing half: what production-ready actually means, written for founders who don't have a senior engineer to ask, plus the rules, prompts and automated checks that make your AI build it that way.

Built for non-developer founders and indie hackers using Claude Code, Cursor, Codex, Lovable, Bolt, Replit or any other AI coding tool.

---

## Why this exists

AI-built apps keep shipping with the same handful of holes:

- Databases anyone can read, because access rules were never written
- Secret API keys sitting in the browser for anyone to copy
- Paywalls bypassed from the browser console
- One unprotected endpoint running up a five-figure AI bill
- No backups, no error alerts, no idea anything broke until customers complain

None of these are hard to prevent. They're just invisible until they go wrong, and AI won't bring them up unless you ask.

## How it works: three layers

| Layer | Folder | What it does |
|---|---|---|
| **1. Rules** | [`agent-rules/`](agent-rules/) | Drop-in `AGENTS.md` / `CLAUDE.md` / Cursor rules. Your AI reads them every session and writes safer code by default |
| **2. Prompts** | [`prompts/`](prompts/) | Copy-paste prompts for each phase: plan, build, review, security audit, launch, incident |
| **3. Guardrails** | [`guardrails/`](guardrails/) | Git hooks and GitHub Actions that block secrets, broken builds, failing tests and vulnerable dependencies, no matter who wrote the code |

Plus the knowledge behind them:

| Folder | What's inside |
|---|---|
| [`docs/`](docs/) | Plain-language guides: security, data access, scalability, reliability, observability, payments, legal, testing, customer-readiness |
| [`checklists/pre-launch.md`](checklists/pre-launch.md) | The full go/no-go list, marked blocker vs. should-fix |
| [`playbooks/`](playbooks/) | Stack-specific guides. Currently: [Next.js + Supabase + Vercel](playbooks/nextjs-supabase-vercel.md) |
| [`template/`](template/) | A small working Next.js + Supabase app with auth, row-level security, rate limiting, validation, logging, error tracking, security headers and tests already wired. Copy from it or start from it |

## Quick start

**Starting a new project**
1. Read [`docs/00-start-here.md`](docs/00-start-here.md) (10 minutes).
2. Run the [plan prompt](prompts/01-plan.md) to produce your `SPEC.md`.
3. On Next.js + Supabase? Copy [`template/`](template/) as your starting point.
4. Copy [`agent-rules/`](agent-rules/) and [`guardrails/`](guardrails/) into your project.
5. Build one feature at a time with the [build](prompts/02-build.md) and [review](prompts/03-review.md) prompts.
6. Before launch: [security audit](prompts/04-security-audit.md), [launch review](prompts/05-launch.md), [pre-launch checklist](checklists/pre-launch.md).

**Already built something?**
1. Copy [`agent-rules/`](agent-rules/) and [`guardrails/`](guardrails/) into it.
2. Run the [security audit prompt](prompts/04-security-audit.md) in a fresh AI session.
3. Do the [two-account test](docs/03-data-access.md#the-two-account-test-do-this-before-every-launch) yourself.
4. Fix critical and high findings first, then work through the [pre-launch checklist](checklists/pre-launch.md).

## The ten rules, if you read nothing else

1. **The browser belongs to the attacker.** Security only exists on the server and in the database.
2. **Secrets never reach the browser or git.** Anything with a `NEXT_PUBLIC_`/`VITE_` prefix is public.
3. **Every endpoint:** who's calling → are they allowed to touch *this* record → rate limit → validate input → then do the work.
4. **Every table with user data has row-level security**, with a policy for each action.
5. **Never use the admin database key for user requests.**
6. **Grant paid access only from verified payment webhooks**, never from the success page.
7. **Limit every list query, index every common filter**, and never query inside a loop.
8. **Back up, and test a restore**, before you have data you can't lose.
9. **Get alerted** on errors and downtime before customers notice.
10. **Review AI code in a fresh session**, and never let the AI edit a test to make it pass.

## Honest limits

This repo makes AI-built apps dramatically safer. It doesn't make them guaranteed safe. Nothing does, including code written by experienced engineers. Once you handle sensitive data (health, finance, children) or real revenue, pay for a professional security review. Use this repo to make that review short and cheap.

## Contributing

Found a mistake, an outdated pattern, or a failure mode we're missing? See [CONTRIBUTING.md](CONTRIBUTING.md). Playbooks for other stacks are especially welcome.

## License

[MIT](LICENSE)
