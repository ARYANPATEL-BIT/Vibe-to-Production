---
name: incident
description: Handle a production incident. Stop the damage, find the cause, fix it safely.
argument-hint: "[what's broken]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/06-incident.md`. First give the user the roll-back advice above the code block. Then carry out the prompt inside its `text` code block against the current project, and give the user the advice that comes after the block.

What's broken: $ARGUMENTS

Use that to fill the [bracketed] placeholders, and ask the user for anything still missing. If it's empty, ask the user what's broken before you start.
