---
name: audit
description: Run a full security audit of the whole codebase, as an attacker would see it.
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/04-security-audit.md`. Carry out the prompt inside its `text` code block against the current project, then give the user the advice that comes after the block.

If this session wrote the code being checked, say once that a fresh session (`/clear`) gives a less biased result, then carry on.
