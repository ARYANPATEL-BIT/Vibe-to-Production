---
name: plan
description: Interview you and write a SPEC.md before any code gets written.
argument-hint: "[what you want to build]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/01-plan.md`. Carry out the prompt inside its `text` code block against the current project, then give the user the advice that comes after the block.

What the user wants to build: $ARGUMENTS

Use that to fill the [bracketed] placeholder. If it's empty, ask the user what they want to build before you start.
