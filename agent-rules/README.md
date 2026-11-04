# Agent rules

The easiest way to install this is the one-prompt install in [`INSTALL.md`](../INSTALL.md) (see the [Quick start](../README.md#install-in-one-prompt)). The manual steps follow.

Drop-in instruction files your AI coding tool reads at the start of every session, so it writes production-grade code by default instead of only when you remember to ask.

| File | Read by | Copy to |
|---|---|---|
| `AGENTS.md` | Codex, Cursor, Gemini CLI, Copilot, Windsurf, Zed, Jules and most other agents | Project root |
| `CLAUDE.md` | Claude Code (it imports `AGENTS.md`, so the rules live in one place) | Project root |
| `.claude/settings.json` | Claude Code: blocks reading/editing real `.env` files, asks before push, deploy and production DB changes | `.claude/` in project root |
| `.cursor/rules/production.mdc` | Cursor (short always-on version, for older setups that don't pick up `AGENTS.md`) | `.cursor/rules/` in project root |

```bash
# from the root of your project
cp path/to/vibe-to-prod/agent-rules/AGENTS.md path/to/vibe-to-prod/agent-rules/CLAUDE.md .
cp -r path/to/vibe-to-prod/agent-rules/.claude path/to/vibe-to-prod/agent-rules/.cursor .
```

Already have a `CLAUDE.md` or `.claude/settings.json`? Merge by hand rather than overwriting.

## Customize

- Fill in the "Project context" section of `CLAUDE.md` (or add one to `AGENTS.md`).
- Add stack-specific rules at the end of `AGENTS.md`. For Next.js + Supabase, the "Things AI gets wrong" table in the [playbook](../playbooks/nextjs-supabase-vercel.md) translates directly into rules.
- Every time the AI makes the same mistake twice, add a one-line rule for it.

## Limits (read this)

Rules files reduce mistakes. They don't eliminate them. Agents still drift in long sessions, misread rules, or follow your latest request over the file. That's why this repo also has [`prompts/`](../prompts/) for review and [`guardrails/`](../guardrails/) that check the code no matter who wrote it.

Keep the file short. Long rule files get skimmed by models the same way they do by people.
