---
title: "Back-of-the-envelope math"
description: "Rough math for requests per second, storage, bandwidth and cost per user, so you build for the load you'll actually have and know what each user costs you."
level: foundation
---

## What it is

Back-of-the-envelope math is a rough calculation with round numbers that answers "will this work, and what will it cost?" before you build. The goal is the right order of magnitude: is it 5 requests per second or 5,000? 1 GB or 1 TB? $0.10 per user or $10? Being off by a factor of two doesn't matter. Being off by a factor of a hundred decides whether you need one server or a team.

## Why it matters

It stops you building the wrong thing in both directions. Without numbers, AI tools and blog posts push you toward microservices, queues and caches for an app that one small server would run for years. They're just as likely to miss the feature that costs more per user than the user pays you.

The second one ends companies. AI calls, email, SMS, file storage and bandwidth all grow with usage, and some grow with a single user's behaviour. If you know your cost per active user, you can price for it, cap it, and spot the moment one account starts costing a fortune. The [scalability guide](../../ship/04-scalability.md) says to write that number in your `SPEC.md`; this lesson shows how to get it.

## How it works

Four estimates, all from the same few inputs:

```text
                 +--> requests per user ---> requests per second ---> one server enough?
                 |
  active users --+--> data per user -------> storage per month -----> which plan, full when?
                 |
                 +--> pages per user ------> bandwidth per month ---> free tier or a bill?
                 |
                 +--> paid calls per user -> cost per user ---------> does the price cover it?
```

**1. Requests per second.** Daily active users times requests per user per day, divided by the seconds in a day. A day has 86,400 seconds; call it 100,000 to keep the arithmetic easy. Traffic isn't spread evenly, so multiply by a peak factor of around 5 for a normal busy hour, more for a launch.

```text
  10,000 daily users x 50 requests each = 500,000 requests a day
  500,000 / 100,000 seconds              = 5 requests per second on average
  x 5 for the busy hour                  = 25 requests per second at peak
```

A single small server and a managed Postgres database handle that comfortably, so the design question is answered: one app, no extra moving parts.

**2. Storage.** Things stored per user times their size. Keep database rows and files apart, because files are usually far bigger and are stored and billed differently.

```text
  Database: 10,000 users x 20 notes a month x 2 KB  = 400 MB a month, about 5 GB a year
  Files:    10,000 users x 5 photos a month x 2 MB  = 100 GB a month
```

The database is small for years. The photos are what you'll pay for, which tells you to resize them on upload.

**3. Bandwidth.** Page views times data sent per view. Files browsers have already cached don't count again.

```text
  10,000 users x 5 page views a day x 30 days = 1.5 million views a month
  x 500 KB per view (after caching)           = 750 GB a month
```

Compare that with what your host includes before it starts charging.

**4. Cost per active user.** For each paid service: uses per user times price per use. AI is the one to watch. Models charge per **token**, a chunk of text of roughly four characters of English.

```text
  20 AI requests a day x 2,000 tokens each      = 40,000 tokens a day
  x 30 days                                     = 1.2 million tokens a month
  x $3 per million tokens (an example price)    = $3.60 per user per month
```

If you charge $10 a month, AI alone takes over a third of it, and a user who uses it ten times as much costs you more than they pay. Check your provider's current prices; output tokens usually cost several times more than input tokens.

## Trade-offs

| Build for | Cost now | Speed of building | Risk |
|---|---|---|---|
| Today's numbers, with no headroom | Lowest | Fastest | A launch spike or one heavy user can surprise you |
| About 10x your 12-month estimate | Low | Fast | Usually none: this is the sweet spot |
| "Millions of users" from day one | High | Slow | You spend months on scale you may never need, and ship late |

## Numbers to remember

- 1 day ≈ 100,000 seconds (86,400). 1 month ≈ 2.6 million seconds.
- 1 million requests a day is about 12 per second on average.
- Peaks are several times the average; launches and big newsletter sends are more.
- 1 KB x 1 million = 1 GB. 1 GB x 1,000 = 1 TB.
- 1 token ≈ 4 characters ≈ ¾ of an English word, so 1,000 words is about 1,300 tokens.
- A managed Postgres database on a small plan handles hundreds to thousands of simple, indexed queries per second.

## Where it bites a vibe-coded app

You ask for an "AI summary" feature. The AI writes:

```ts
// No per-user limit, no cap on input size, no cap on output length.
export async function POST(req: Request) {
  const { text } = await req.json();
  const summary = await ai.generate({ prompt: `Summarise this:\n${text}` });
  return Response.json({ summary });
}
```

Now do the math for an abuser instead of a normal user. A 100-page document is about 50,000 words, around 65,000 tokens. A script that sends it 500 times uses about 32 million tokens: roughly $100 at the example price above, from one free account in an afternoon. With 100 throwaway accounts, $10,000.

The fix is a few lines: a maximum input length, a maximum output length on the model call, a per-user daily limit stored in a shared store, and a hard spending cap in the provider's dashboard as the last line of defence. The [security guide](../../ship/02-security.md#6-rate-limiting-and-abuse) has the rate-limiting rules, and the [scalability guide](../../ship/04-scalability.md#6-unbounded-costs) the cost ones.

## Tell your AI

```text
Read SPEC.md if it exists, then the code. Estimate, for [users at launch] daily active users at launch and [users in a year] in a year:

1. Requests per second, average and peak (assume peak is 5x average unless you have a reason to change it).
2. Database storage growth per month, and file storage growth per month.
3. Bandwidth per month.
4. Cost per active user per month for every paid service the app calls (AI, email, SMS, storage, hosting), showing each formula and the price you used with a link to where you found it. Say which prices you couldn't find.

Then tell me which free-tier or plan limit we hit first and at how many users, and flag every feature where a single user could run up an unbounded bill. Don't change any code.
```

## Check your code

- [ ] Every call to a paid API has a per-user limit stored in a shared store.
- [ ] Inputs to paid calls have a maximum size, and AI calls set a maximum output length.
- [ ] Every paid provider has a spending cap and a budget alert.
- [ ] Cost per active user is written in `SPEC.md`, with the formula.
- [ ] Uploaded images are resized and size-limited.
- [ ] You know which free-tier limit you'll hit first.

## Check yourself

1. 50,000 daily users make 40 requests each per day. What's the average requests per second, and roughly the peak?
2. 5,000 users each upload 10 photos a month at 3 MB each. How much file storage after a year?
3. An AI feature costs $0.02 per use and free users get it unlimited. One free user uses it 50 times a day. What do they cost you per month?

**Answers**

1. 2,000,000 requests a day, divided by 100,000 seconds, is 20 per second on average, and about 100 at a 5x peak. Still a job for one server.
2. 5,000 x 10 x 3 MB = 150 GB a month, so about 1.8 TB after a year. Resize on upload.
3. $0.02 x 50 x 30 = $30 a month, for a user paying nothing. Free plans need a usage limit.

## Go deeper

- [Latency numbers every programmer should know](https://gist.github.com/jboner/2841832): rough costs of common operations, from memory reads to a round trip across the world.
- [The System Design Primer](https://github.com/donnemartin/system-design-primer): free and widely used, with powers-of-two and latency tables for estimates in its appendix.
