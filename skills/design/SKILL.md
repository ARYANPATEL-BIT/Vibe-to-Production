---
name: design
description: Estimate your scale and write a DESIGN.md with the simplest architecture that meets the numbers.
argument-hint: "[what you're building]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/prompts/07-design.md`. Carry out the prompt inside its `text` code block against the current project, then give the user the advice that comes after the block.

What the user is building: $ARGUMENTS

Use that to fill the [bracketed] placeholder. If it's empty, ask the user what they're building before you start.

The lessons are also on disk: to pick them, read the `description:` line in each `${CLAUDE_PLUGIN_ROOT}/content/learn/*/*.md` file instead of fetching llms.txt, and link to each lesson's site URL, `https://aryanpatel-bit.github.io/Vibe-to-Production/learn/<part>/<slug>`.
