# Prompts

Copy-paste prompts for each phase. Each one makes the AI do the work a senior engineer would do at that stage: ask the right questions, check its own work, and tell you what it couldn't verify.

| Phase | Prompt | When | Fresh session? |
|---|---|---|---|
| Plan | [01-plan.md](01-plan.md) | Before writing any code, or before a big feature | Yes |
| Build | [02-build.md](02-build.md) | Each feature or fix | Optional |
| Review | [03-review.md](03-review.md) | After each change, before merging | **Yes** |
| Audit | [04-security-audit.md](04-security-audit.md) | Before launch, before taking payments, then monthly | **Yes** |
| Launch | [05-launch.md](05-launch.md) | The week before launch | Yes |
| Incident | [06-incident.md](06-incident.md) | Something is broken in production | Yes |

**Why fresh sessions:** the session that wrote the code believes it's correct. A new session with no memory of writing it reviews it like a stranger would, which is what you want. Using a different model for review than for building helps even more.

**How to use:** copy the block inside the prompt file, replace anything in `[brackets]`, paste it into your agent (Claude Code, Cursor, Codex…) at the root of your project.
