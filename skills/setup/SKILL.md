---
name: setup
description: Install the vibe-to-prod rules and guardrails into this project and adapt them to its stack.
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/INSTALL.md` and follow its steps to set up the current project.

- `${CLAUDE_PLUGIN_ROOT}` is already the cloned repo ("the clone" in INSTALL.md), so skip any clone step.
- Never delete anything under `${CLAUDE_PLUGIN_ROOT}`. Skip INSTALL.md's "delete the temp clone" step.
- For the final next step, tell the user to run `/vibe:audit` in a fresh session.
