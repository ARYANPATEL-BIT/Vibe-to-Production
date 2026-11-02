# Project instructions

@AGENTS.md

## Project context

<!-- Fill this in. Keep it short; Claude reads it every session. -->
- What this app does:
- Stack:
- Spec: see SPEC.md
- Commands: `npm run dev`, `npm run check` (lint + typecheck + tests + build)

## Claude Code specifics

- Use plan mode for anything bigger than a small fix, and wait for approval before editing.
- After finishing a change, run `npm run check` and fix failures before reporting done.
- Don't read `.env` files with real values. Use `.env.example` to learn variable names.
