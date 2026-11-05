---
name: launch
description: Check the app is ready for real customers and get a go / no-go verdict.
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/05-launch.md`. Carry out the prompt inside its `text` code block against the current project, then give the user any advice that comes after the block. If the project has no `checklists/pre-launch.md`, use `${CLAUDE_PLUGIN_ROOT}/checklists/pre-launch.md`.

If this session wrote the code being checked, say once that a fresh session (`/clear`) gives a less biased result, then carry on.
