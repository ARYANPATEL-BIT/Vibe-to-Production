# Contributing

Thanks for helping make AI-built software safer.

## What helps most

- **Corrections.** Something outdated or wrong? Open an issue or PR with a link to the source (official docs preferred).
- **Real failure modes.** A way AI-built apps break that isn't covered yet. Describe what happened, why AI tends to do it, and how to prevent it.
- **Playbooks for other stacks.** Follow the shape of [`playbooks/nextjs-supabase-vercel.md`](playbooks/nextjs-supabase-vercel.md): free-tier reality, keys, auth patterns, data access, deploy, and a "things AI gets wrong" table.
- **Better prompts.** Show a before/after of what the prompt catches.

## Style

- Write for a smart founder who isn't a developer. Define jargon or avoid it.
- Every guide section ends in something checkable: a test, a checklist item, or a command.
- Prefer free tools. If something requires a paid plan, say so.
- Keep template code minimal and readable. No abstraction the example doesn't need.
- Name the version of any tool or library whose API you describe.

## Template changes

Run `npm run check` in `template/` before opening a PR. CI runs the same checks.
