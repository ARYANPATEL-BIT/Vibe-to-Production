---
name: build
description: Plan one feature or fix, wait for your OK, build it and run the checks.
argument-hint: "[the feature or fix]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/02-build.md`. Carry out the prompt inside its `text` code block against the current project, then give the user the advice that comes after the block.

The feature or fix: $ARGUMENTS

Use that to fill the [bracketed] placeholder. If it's empty, ask the user what to build before you start.
