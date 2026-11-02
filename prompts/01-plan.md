# 01 · Plan

Use before writing any code for a new product, or before a large new feature. The output is a `SPEC.md` your agent reads before every future change.

```text
I want to build: [describe your product or feature in a few sentences, who it's for, and what problem it solves].

Before writing any code, interview me to produce a SPEC.md. Ask me questions one small group at a time (max 4 per message), in plain language, and suggest sensible defaults I can just accept. Cover:

1. Users and roles: who uses this, what each role can do, how someone becomes an admin.
2. Data: every kind of thing we store, its fields, and whether it's sensitive (personal info, payments, health, private messages, children's data).
3. Access table: for each kind of data, who can read, create, update and delete it. Push me on the "nobody" and "system only" cells.
4. Money: how we charge, what paying unlocks, what happens on failed payment or cancellation.
5. Outside services: every third-party service we'll call, what it costs per use, what happens if it's down, and who can trigger it.
6. Abuse: for each feature, the worst thing a malicious user could do, and how we prevent it.
7. Scale and cost: rough expected users in 6 months, cost per active user, and spending caps.
8. Non-goals: what we are deliberately NOT building in v1.

Then:
- Write SPEC.md with those sections, including the access table as a markdown table.
- Recommend a stack I can run on free tiers to start, and say which free-tier limit I'll hit first and whether its terms allow commercial use.
- List the first 5 build steps, each small enough to review in one sitting, starting with auth and the database schema with access rules.

Don't write any application code yet.
```

**After:** read SPEC.md yourself. If you can't explain the access table out loud, it's not done.
