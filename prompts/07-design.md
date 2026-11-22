# 07 · Design

Use after the plan and before you build, or when your numbers are about to grow 10x or you're adding a big piece of infrastructure. The output is a `DESIGN.md` that sits next to `SPEC.md`: what the system must handle, the estimates behind it, and the simplest design that meets them.

```text
I'm building: [what you're building, in a few sentences].

Before any more code is written, help me design the system and write it down in DESIGN.md.

1. Read SPEC.md if it exists. Then read the codebase to learn the stack: framework, hosting, database, auth, file storage, and every outside service it calls. If there's no code yet, say so and use the stack in SPEC.md.

2. Ask me at most 5 questions, in one message, in plain language, each with a sensible default I can just accept. Skip any that SPEC.md already answers:
   - Daily active users at launch, and in a year.
   - The read/write mix: mostly people reading, or lots of writing?
   - How much data each user creates: text, files, images, video.
   - Whether anything must update live: chat, collaboration, notifications, dashboards.
   - My monthly budget for infrastructure.

3. Do back-of-the-envelope estimates from my answers, with round numbers and your working shown: requests per second (average and peak), database and file storage growth per month, bandwidth per month, and cost per active user for every paid service. Say which prices you looked up and where.

4. Write DESIGN.md with these sections:
   - Requirements: what the system must do, and the numbers it must handle.
   - Estimates: the calculations from step 3.
   - API surface: every endpoint or server action, and who may call it.
   - Data model: tables, key columns, relationships, indexes, and who can read and write each table.
   - Diagram: a plain-text diagram of the parts and how a request flows between them.
   - Key decisions: for each choice (database, hosting and region, auth, file storage, background jobs, real-time, caching...), what you chose, the trade-off it makes, and a link to the lesson behind it.
   - Risks: what is most likely to break, get slow or get expensive first, and the warning sign to watch for.
   - What not to build yet: things that sound necessary but the numbers don't justify, and the number at which each would become worth it.

Default to the simplest design that meets the numbers: one app on managed services, with the server in the same region as the database. Don't add microservices, queues, caches, read replicas or extra databases unless the estimates show they're needed. If you add one, show the number that requires it.

For lesson links, use the lessons listed at https://aryanpatel-bit.github.io/Vibe-to-Production/llms.txt: pick them by their descriptions and link to their URLs. If no lesson fits a decision, say so instead of linking something unrelated.

Don't write any application code.
```

**After:** read "What not to build yet" first. If it's empty, ask the agent to justify every part of the design with a number. Ask your agent to update `DESIGN.md` whenever a decision changes, and run this again when your real numbers pass the estimates.
