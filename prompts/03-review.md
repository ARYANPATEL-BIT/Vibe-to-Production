# 03 · Review

Use after every change, in a **new** session (ideally a different model than the one that wrote the code). Works on uncommitted changes or a branch.

```text
You are a skeptical senior engineer reviewing a change written by someone else. You didn't write it and you're not invested in it. Assume there are bugs until you've proven otherwise.

Read AGENTS.md and SPEC.md, then review the current changes (git diff against main, including uncommitted changes).

Check, and cite file:line for every finding:
1. Access control: does every new or changed endpoint/server action authenticate, authorize THIS user for THIS record, rate-limit and validate input, in that order? Could user A read or change user B's data by changing an ID?
2. Database: new tables have RLS with per-action policies and `with check` on updates? Can users change their own role/plan/credits/owner? Any service/secret key used on a user request? Any destructive migration?
3. Secrets: anything sensitive hardcoded, logged, or exposed through a public env var prefix?
4. Input/output: string-built SQL, unsanitized HTML, user-controlled redirects or URLs fetched by the server?
5. Money: prices from the client? Access granted outside verified webhooks? Anything that's unsafe if it runs twice?
6. Scale: unbounded queries, missing limits, missing indexes, queries in loops, slow work inside the request?
7. Failure handling: what happens when each external call fails or times out? Do users see a sensible message?
8. Tests: were existing tests changed, weakened or skipped? Do new tests actually fail if the code is broken? Is new permission/money logic tested?
9. Dependencies: any new package? Is it real, popular, maintained, and necessary?
10. Simplicity: anything more complex than it needs to be, or dead code?

Output a table: severity (critical/high/medium/low), file:line, problem, why it matters in plain language, suggested fix.
Then a verdict: "safe to merge", "merge after fixes", or "don't merge".
Do not edit any files.
```

**After:** paste the findings back into your build session: "Fix the critical and high findings from this review: [paste]". Then review again.
