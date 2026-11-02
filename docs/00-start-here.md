# 00 · Start here

## The uncomfortable truth

AI can write code that works on your laptop in an afternoon. That was never the hard part.

The hard part is everything a customer never sees until it fails: who can read whose data, what happens when 500 people sign up at once, what happens when the payment webhook arrives twice, how you find out the site is down before your customers tweet about it.

AI coding tools skip these by default. Not because they can't do them, but because you didn't ask, and "it works" is what they optimize for. Vibe-coded apps have shipped with:

- **Databases readable by anyone.** Tables created without access rules, so the public key in the browser could read every user's data. In 2025 a researcher found 170+ apps built with one popular AI app builder exposing data exactly this way (CVE-2025-48757).
- **Secret keys in the browser.** API keys for OpenAI, Stripe or the database admin key shipped in frontend code, then scraped and abused within days.
- **Paywalls bypassed from the browser console**, because the "is this user paying?" check only happened on the client.
- **Five-figure cloud bills** from one unprotected endpoint that called a paid AI API in a loop.

None of these needed a genius attacker. They needed someone curious with browser dev tools.

## What "production-ready" means in this repo

An app is production-ready when it can survive four things:

| It survives… | Which means… | Guide |
|---|---|---|
| **Attackers** | Secrets hidden, every request checks who's asking and whether they're allowed, inputs validated, abuse rate-limited | [02 Security](02-security.md), [03 Data access](03-data-access.md) |
| **Growth** | Queries bounded and indexed, slow work moved out of requests, costs capped | [04 Scalability](04-scalability.md) |
| **Failure** | Errors handled, data backed up and restorable, safe deploys and rollbacks | [05 Reliability](05-reliability.md) |
| **You not watching** | You get alerted when something breaks, and can see why | [06 Observability](06-observability.md) |

And it's **customer-ready** when it also handles money correctly, follows the law, and feels trustworthy: [07 Payments](07-payments.md), [08 Legal & privacy](08-legal-and-privacy.md), [10 Customer-ready](10-customer-ready.md).

## How this repo works: three layers

Reading guides doesn't make code safe. AI agents forget, you skim, deadlines happen. So this repo stacks three layers, each catching what the one before misses.

```
1. RULES        agent-rules/    The AI reads these every session, so it writes safer code by default.
        ↓
2. PROMPTS      prompts/        You run these at each phase to make the AI plan, review and audit its own work.
        ↓
3. GUARDRAILS   guardrails/     Automated checks that block bad code from being committed or deployed,
                                no matter who (or what) wrote it.
```

The guides in `docs/` explain the *why* behind all three, so you can tell when the AI is wrong.

## The workflow

```
  Plan  ──►  Build  ──►  Review  ──►  Audit  ──►  Launch
   │          │           │            │            │
 01-plan   02-build   03-review   04-security   05-launch
 prompt    prompt     prompt      -audit prompt  prompt
   │                                                │
   └────────── guardrails run on every commit ──────┘
```

1. **Plan** before any code. Describe users, data and who can see what. ([01 Plan](01-plan-before-you-prompt.md))
2. **Build** one feature at a time, small enough to review.
3. **Review** each change with a fresh AI session acting as a skeptical senior engineer.
4. **Audit** security before anything touches real users or real money.
5. **Launch** with the pre-launch checklist, not vibes.

## Setup in 10 minutes

1. Copy `agent-rules/AGENTS.md` and `agent-rules/CLAUDE.md` into the root of your project. Using Cursor? Also copy `agent-rules/.cursor/`. Using Claude Code? Also copy `agent-rules/.claude/`.
2. Copy everything in `guardrails/` into your project root and follow [guardrails/README.md](../guardrails/README.md).
3. Starting fresh on Next.js + Supabase? Start from [`template/`](../template/) and read the [playbook](../playbooks/nextjs-supabase-vercel.md).
4. Bookmark [`checklists/pre-launch.md`](../checklists/pre-launch.md).

## All guides

| # | Guide | Read when |
|---|---|---|
| 01 | [Plan before you prompt](01-plan-before-you-prompt.md) | Before any code |
| 02 | [Security](02-security.md) | Before your first real user |
| 03 | [Data access](03-data-access.md) | Before your first real user. The most important one |
| 04 | [Scalability](04-scalability.md) | Before you have real traffic |
| 05 | [Reliability](05-reliability.md) | Before you have data you can't lose |
| 06 | [Observability](06-observability.md) | Before launch |
| 07 | [Payments](07-payments.md) | Before you take money |
| 08 | [Legal & privacy](08-legal-and-privacy.md) | Before launch |
| 09 | [Testing](09-testing.md) | From the first feature |
| 10 | [Customer-ready](10-customer-ready.md) | Before launch |

## Rules for working with AI

- **You own the outcome, not the AI.** "The AI wrote it" is not an answer a customer, a regulator or your bank will accept.
- **Small steps.** One feature per session. A 2,000-line change can't be reviewed by you or by another AI.
- **Ask why.** When the AI does something you don't understand, ask it to explain in plain words. If the explanation doesn't make sense, the code probably doesn't either.
- **Never paste real secrets into a chat.** Use placeholders like `sk_test_xxx`.
- **Distrust "done".** AI agents report success when tests pass, even if they edited the test. Look at what changed.
- **Fresh eyes.** Review in a new session. The session that wrote the code is biased toward believing it's correct.
