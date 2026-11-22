---
title: "Clients and servers"
description: "Frontend vs backend, what a server actually is, and what \"serverless\" really means: code that starts on demand, forgets everything between requests and multiplies under load."
level: foundation
---

## What it is

A client is the program that asks: a browser, a mobile app, a script. A server is the program that answers, running on a computer that's always connected to the internet. The frontend is the part of your app that runs on the client (the screens people see and click), and the backend is the part that runs on the server (the rules, the data, the secrets). Think of a restaurant: customers sit in the dining room and order, the kitchen makes the food and handles the money, and customers don't get to walk into the kitchen.

## Why it matters

Putting a piece of logic on the wrong side is behind most serious bugs in AI-built apps. A price, a permission check or an API key on the frontend is a price, check or key the customer can change or copy ([Where code runs](./03-where-code-runs.md) is about exactly this).

The word "serverless" causes a second set of bugs. It sounds like "no server to think about", so code gets written as if there were one long-lived computer remembering things. There isn't, and code that assumes there is works perfectly on your laptop and fails quietly in production.

## How it works

```text
   CLIENT (frontend)              SERVER (backend)               OTHER SERVICES
  +------------------+   HTTP   +--------------------+   SQL   +----------------+
  | browser or app   | -------> | your code:         | ------> | database       |
  | screens, buttons | <------- | check who you are, | <------ +----------------+
  | runs your JS     |          | apply the rules,   |   API   +----------------+
  +------------------+          | hold the secrets   | ------> | Stripe, email, |
                                +--------------------+ <------ | AI model ...   |
                                                               +----------------+
```

The client sends a request; the server decides what's allowed, does the work and sends a response. Your backend can run in three broad ways:

1. **A long-running server.** One process (a running program) stays on all the time, on a host such as Railway, Render, Fly.io or a rented virtual machine. It handles request after request and can keep things in memory between them. You pay for it whether anyone visits or not.
2. **Serverless functions.** You upload functions, and the host (Vercel, Netlify, AWS Lambda, Cloudflare Workers, Supabase Edge Functions) starts copies of them when requests arrive and stops them when traffic dies down. There are still servers; you just never see or manage them. You pay per use.
3. **Backend-as-a-service.** The browser talks almost directly to a hosted database through its API, as with Supabase or Firebase. Your access rules live inside the database itself (row-level security), because there may be no server code in between. See [Data access](../../ship/03-data-access.md).

Most apps mix them: Supabase for data, serverless functions for anything that needs a secret.

What "serverless" really means is easiest to see when traffic arrives:

```text
  request 1 --> [ copy A ]   count = 1
  request 2 --> [ copy B ]   count = 1    new copy, its own empty memory
  request 3 --> [ copy A ]   count = 2
  request 4 --> [ copy C ]   count = 1    another new copy
  ... quiet for a while: every copy is shut down, all memory is gone
  request 5 --> [ copy D ]   count = 1    cold start: slower first response
```

Three consequences follow:

- **Nothing in memory can be relied on.** A variable that counts, caches or remembers lives inside one copy, for as long as that copy lives. Anything that must be shared or kept goes in a database or a shared store such as Redis (a fast key-value database).
- **Copies multiply.** A spike can start hundreds of copies at once, and each can open its own database connection. Databases have a fixed connection limit, so direct connections need a pooler that shares a few connections between many copies. See [Scalability](../../ship/04-scalability.md).
- **They're short-lived.** Hosts cap how long one function run may take. Slow work (sending a batch of emails, processing a video) belongs in a background job.

## Trade-offs

| | Long-running server | Serverless functions | Backend-as-a-service |
|---|---|---|---|
| Cost with no traffic | You pay for it anyway | Close to zero | Close to zero on free tiers |
| Handles a sudden spike | Only up to what you've provisioned | Starts more copies automatically | The provider scales it |
| Memory between requests | Yes, until it restarts | No | Not your concern |
| Cold starts | None | Yes, on the first request after a quiet spell | None for you |
| Long tasks, WebSockets | Fine | Time limits; WebSockets need a separate service | Built-in real-time on some (Supabase, Firebase) |
| Where your security rules live | Your server code | Your function code | The database's access rules |

## Numbers to remember

- A cold start adds anything from a few hundred milliseconds to a couple of seconds to the first request a new copy handles. It depends on the host, the runtime and how much code loads at start-up.
- Postgres allows 100 connections by default. Each serverless copy opening its own can use that up during one busy minute.
- One small long-running server handles hundreds of simple requests per second. Most early apps never need more than one.
- Function time limits differ by host and plan, from seconds to several minutes. Look yours up before relying on a long task finishing.

## Where it bites a vibe-coded app

Ask an AI to rate-limit your login form and you often get this:

```ts
// Works on your laptop. On serverless, each copy has its own Map,
// and the Map is wiped whenever that copy shuts down.
const attempts = new Map<string, number>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const count = (attempts.get(ip) ?? 0) + 1;
  attempts.set(ip, count);
  if (count > 5) return new Response("Too many attempts", { status: 429 });
  // ...check the password
}
```

Locally there's one process, so the test passes. In production an attacker's guesses spread across many copies, and none of them ever counts to six. The same goes for in-memory caches, sessions, "already sent this email" flags and job queues. Keep counters in a shared store; the [security guide](../../ship/02-security.md#6-rate-limiting-and-abuse) shows how.

## Tell your AI

```text
List every piece of backend code in this app and say how each one runs: long-running server, serverless function, edge function, or directly against the database with access rules.

Then find anything that relies on memory surviving between requests: module-level variables, Maps, arrays or objects used as caches, counters, rate limiters, sessions, queues, setInterval timers, or open WebSocket connections. For each, explain what goes wrong when the code runs as many short-lived copies, and propose moving it to the database or a shared store.

Also check: do direct Postgres connections use the provider's pooler URL, and is any request doing work that could exceed the host's time limit? Don't change any code yet.
```

## Check your code

- [ ] No module-level `Map`, array or object is used as a cache, counter, session store or queue in serverless code.
- [ ] Rate limits and anything that must be remembered live in a database or shared store.
- [ ] Direct Postgres connections go through the pooler.
- [ ] Slow work (bulk email, file processing, long AI calls) runs in a background job.
- [ ] Every business rule (prices, permissions, limits) is enforced in backend code or database rules, not only in the frontend.

## Check yourself

1. Your AI says "it's serverless, so it scales automatically." Name two things that don't scale automatically.
2. Why does an in-memory rate limiter pass every test on your laptop?
3. Your app uses Supabase from the browser with no server code. Where do your security rules live?

**Answers**

1. Your database's connection limit, and your bill. Third-party rate limits (your email or AI provider) don't scale either.
2. On your laptop there's one long-running process, so every request shares the same memory. In production, requests spread across many copies that each start from zero.
3. In the database: row-level security policies decide who can read and change each row. If they're missing, anyone with the public key can read everything.

## Go deeper

- [Client-server overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview) (MDN): how requests, responses and servers fit together.
- [Vercel Functions](https://vercel.com/docs/functions): what one serverless platform runs, its limits and how it scales.
