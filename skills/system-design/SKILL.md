---
name: system-design
user-invocable: false
description: Answers architecture and infrastructure decisions for this project from the vibe-to-prod system design lessons. Use when the user is making or asking about an architecture or infrastructure decision, such as choosing a database, caching, queues or background jobs, real-time features, scaling, file storage, auth design, rate limiting, hosting regions, or splitting an app into services. Don't use it for routine feature work, bug fixes or code review where no such decision is being made.
---

1. **Pick the lessons.** Read only the `description:` line of each lesson in `${CLAUDE_PLUGIN_ROOT}/content/learn/*/*.md` (grep for `^description:`, skip `index.md`). Choose the 1–3 lessons that best match the decision, and read only those in full.
2. **Learn the project.** Read `SPEC.md` and `DESIGN.md` if they exist, and enough code to know the stack, hosting, regions and rough scale. If the answer depends on a number you don't have (users, data size, budget), ask for it or state your assumption.
3. **Answer for this project.** Recommend the simplest option that works at its numbers, state the trade-off in a sentence or two, and say at what point a bigger option would become worth it.
4. **Point to the lessons** you used, by title, with their site URL: `https://aryanpatel-bit.github.io/Vibe-to-Production/learn/<part>/<slug>`, where `<part>` is the lesson's folder and `<slug>` its filename without `.md`.

If no lesson covers the decision yet, answer anyway and say there's no lesson on it yet.
