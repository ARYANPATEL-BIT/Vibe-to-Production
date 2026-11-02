# 02 · Build

Use for each feature or fix. One feature per session works best.

```text
Read SPEC.md and AGENTS.md first.

Task: [describe the feature or fix in plain language, including who should be able to use it].

Before writing code, reply with a short plan:
- Files you'll create or change
- Any new table, column, endpoint, server action, env var, dependency or third-party call
- For each new endpoint or action: how it authenticates, authorizes, rate-limits and validates input
- For each new table: its RLS policies per action
- What could go wrong (security, data loss, cost, performance) and how you're preventing it
- Which tests you'll add

Wait for my OK before writing code.

When you're done:
- Run lint, typecheck, tests and build and fix any failures. Do not modify or skip existing tests to make them pass.
- Give me a plain-language summary: what changed, every security-relevant change, any new env var I must set in my hosting dashboard, and what you did NOT verify plus how I can check it myself.
```

**Tips**
- If the plan is longer than one screen, the task is too big. Ask for it to be split.
- If you don't understand part of the plan, ask: "Explain [that part] like I'm not a developer. What would go wrong if we skipped it?"
- Don't merge until you've run [03-review.md](03-review.md) in a fresh session.
