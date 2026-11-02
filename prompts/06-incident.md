# 06 · Incident: something is broken in production

Use when customers are affected. Fresh session. First, if a recent deploy caused it, **roll back now** (Vercel: Deployments → last good one → Instant Rollback) and investigate after. Fixing forward under pressure is how one incident becomes two.

```text
Production incident. Symptoms: [what users see, since when, how many affected].
Recent changes: [last deploys, migrations, config or env var changes, provider outages you know of].
Error details: [paste the Sentry error / log lines. REMOVE any personal data, tokens or keys before pasting].

Help me in this order:
1. Most likely causes, ranked, with what evidence would confirm or rule out each.
2. The fastest safe way to stop the damage (rollback, feature flag off, disable an endpoint), and any risk of doing it.
3. Once confirmed, the smallest fix, plus a test that reproduces the bug and fails before the fix.
4. Whether any data was exposed, corrupted or lost, and how to check. If user data may have been exposed, tell me so explicitly; I may have legal obligations to notify users.

Don't run migrations, delete anything, or deploy without asking me first.
```

**After it's fixed**, write a short note in `docs/incidents/YYYY-MM-DD.md`: what happened, impact, root cause, the fix, and one thing that would prevent it next time (a test, a guardrail, a rule in AGENTS.md). Then add that thing.
