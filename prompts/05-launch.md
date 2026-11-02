# 05 · Launch readiness

Use the week before launch, in a fresh session. It checks everything in the [pre-launch checklist](../checklists/pre-launch.md) that can be checked from the code, and tells you what's left for you.

```text
We're launching this app to real customers soon. Read AGENTS.md, SPEC.md and checklists/pre-launch.md (if present). Then act as a launch reviewer.

For every item in the pre-launch checklist, mark it as one of:
- PASS: with evidence (file:line, config, or command output)
- FAIL: with what's missing and the fix
- CAN'T CHECK FROM CODE: and tell me exactly how to check it myself (which dashboard, which setting, what to look for)

Also check:
- Every page and form has loading, empty, error and success states.
- There's an error page, a 404 page, a health endpoint, and error tracking on server and browser.
- Every list query is limited; common queries are indexed.
- Every env var used in code is in .env.example, and list which ones must be set in production.
- Privacy policy and terms pages exist and are linked; list every third-party service the code sends user data to, so I can confirm the privacy policy names them all.
- Account deletion and data export exist.
- Run lint, typecheck, tests, build and the dependency audit, and report results.

Output:
1. A launch verdict: GO, GO WITH RISKS (list them), or NO GO.
2. Blockers in priority order.
3. My personal to-do list of the CAN'T CHECK FROM CODE items.
Don't edit files.
```
