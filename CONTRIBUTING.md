# Contributing

Thanks for helping make AI-built software safer.

## What helps most

- **Corrections.** Something outdated or wrong? Open an issue or PR with a link to the source (official docs preferred).
- **Real failure modes.** A way AI-built apps break that isn't covered yet. Describe what happened, why AI tends to do it, and how to prevent it.
- **Playbooks for other stacks.** Follow the shape of [`content/ship/playbooks/nextjs-supabase-vercel.md`](content/ship/playbooks/nextjs-supabase-vercel.md): free-tier reality, keys, auth patterns, data access, deploy, and a "things AI gets wrong" table.
- **Better prompts.** Show a before/after of what the prompt catches.

## Style

- Write for a smart founder who isn't a developer. Define jargon or avoid it.
- Every guide section ends in something checkable: a test, a checklist item, or a command.
- Prefer free tools. If something requires a paid plan, say so.
- Keep template code minimal and readable. No abstraction the example doesn't need.
- Name the version of any tool or library whose API you describe.
- Content is plain .md with frontmatter; relative links start with `./` or `../`.

## Writing a lesson

Lessons live in `content/learn/<part>/<NN-slug>.md`, for example `content/learn/00-foundations/04-dns.md`. The number prefix in the filename sets the order; don't edit `meta.json` to add a lesson.

**Frontmatter**

```yaml
---
title: "DNS"
description: "How a name like example.com becomes an address a computer can reach, which records your site and email need, and why changes take time to spread."
level: foundation
---
```

- `description` is one sentence. The `system-design` skill reads only descriptions to decide which lessons to open, so say what the lesson covers in the words someone asking about it would use.
- `level` is one of `foundation`, `builder`, `scale` or `deep`.

**Rules**

- Plain `.md`: no JSX, no raw HTML. Relative links start with `./` or `../`.
- 700–1,000 words of prose, 1,200 at most. Code blocks, diagrams, tables and URLs don't count.
- Diagrams are ` ```text ` blocks drawn in ASCII, so they read the same raw, on GitHub and on the site.
- Link to earlier lessons instead of explaining their topic again.

**Sections, in this order**

1. `## What it is`: 2–4 plain sentences. Define every term the first time it appears. One analogy is fine.
2. `## Why it matters`: what breaks, costs money or gets slow without it.
3. `## How it works`: the mechanism, with diagrams.
4. `## Trade-offs`: a table.
5. `## Numbers to remember`: rough figures and rules of thumb. Only include numbers you're confident are correct today.
6. `## Where it bites a vibe-coded app`: a concrete failure AI tools write by default, with a short code or config snippet where it helps.
7. `## Tell your AI`: one ` ```text ` block with a copy-paste prompt the reader gives their coding agent.
8. `## Check your code`: a short checklist for reviewing what the agent wrote.
9. `## Check yourself`: 3 questions, then an "Answers" list below them.
10. `## Go deeper`: 1–3 free, authoritative links (official docs, RFCs, MDN, well-known engineering posts). Open every link before you add it.

**Voice:** match `content/ship/`: plain, direct and honest, with no hype and no filler. Write for a founder who has never studied computer science. A developer should still learn something.

## Template changes

Run `npm run check` in `template/` before opening a PR. CI runs the same checks.
