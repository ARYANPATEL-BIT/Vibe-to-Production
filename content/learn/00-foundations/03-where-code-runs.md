---
title: "Where code runs"
description: "Browser, server or edge: where each piece of your code actually runs, why the browser belongs to the attacker, and which checks must live on your side of the trust boundary."
level: foundation
---

## What it is

Your code runs in three kinds of place. The **browser** is the visitor's own device. The **server** is a machine your host runs for you in one region (a cluster of data centres in one area, such as Washington, D.C. or Frankfurt). The **edge** is small pieces of code running on the CDN's machines in hundreds of cities, close to whoever is visiting. The **trust boundary** is the line between code someone else controls and code you control. Everything in the browser is on their side of it.

## Why it matters

The most common serious hole in AI-built apps is a check that only runs in the browser: a paywall, an "admins only" button, a price, a limit. Anyone can open dev tools (the inspector built into every browser), change what the page does, or skip your page entirely and call your API with curl (a command-line tool that sends any request you type). If the server doesn't check again, the check doesn't exist.

Placement also decides speed. The edge is close to your visitor but usually far from your database, so the wrong code at the edge gets slower, not faster.

## How it works

```text
        THEIR SIDE (untrusted)        |        YOUR SIDE (trusted)
                                      |
   Browser                            |   Edge, server, database
   - your JavaScript, readable        |   - your code, unreadable
   - every API response, readable     |   - secret keys
   - cookies, local storage, editable |   - the real prices, roles, plans
   - dev tools, curl, scripts         |   - the final yes or no
                                      |
   anything can be changed here ---- request ----> check everything here
                                      |
                               trust boundary
```

Two rules follow from the picture:

1. **Everything you send to the browser can be read.** That includes your whole frontend bundle (the JavaScript files your site ships), every environment variable with a public prefix (`NEXT_PUBLIC_`, `VITE_`), and every field in every API response, even fields the screen doesn't show. Open the Network tab in dev tools and it's all there.
2. **Everything the browser sends can be forged.** The request body, the URL, hidden form fields, headers, the user ID, the price, the plan name. The only thing the server can trust is what it checks itself, such as a session it verifies with the auth provider, and data it looks up in its own database.

Modern frameworks blur the line, which is why AI tools get it wrong. In Next.js, a file marked `"use client"` runs in the browser, while server components and server actions (`"use server"`) run on the server, all in the same folder of code. A server action looks like a function call in your code, but it's a public URL anyone can call with any arguments. The [security guide](../../ship/02-security.md#4-every-server-endpoint-is-public) covers what each endpoint must check.

The edge sits on your side of the boundary, so it can hold secrets and make decisions. It's the right place for cheap, data-free work: redirects, blocking obviously bad traffic, checking that a session cookie exists before sending someone to the login page. It's the wrong place for code that talks to your database several times, because the database stays in one region:

```text
  Code at the edge, database in one region:
  visitor --5 ms--> edge --90 ms--> database   x 3 queries = 270 ms

  Code on a server next to the database:
  visitor --90 ms--> server --1 ms--> database x 3 queries =  93 ms
```

## Trade-offs

| | Browser | Edge | Server (one region) |
|---|---|---|---|
| Close to the visitor | Yes, it's their device | Yes | Only if they're near that region |
| Close to your database | No | Usually not | Yes, if you put it there |
| Can hold secrets | Never | Yes | Yes |
| Its checks can be trusted | No | Yes | Yes |
| Good for | Showing things, instant feedback, form hints | Redirects, quick cookie checks, blocking bots | Permissions, payments, anything touching data |

## Numbers to remember

- Big CDNs run edge locations in hundreds of cities, so most visitors are a few milliseconds from one.
- Each database query from the edge pays the full distance to the database's region, often 50–150 ms, every time. From a server in the same region, it's about a millisecond.
- 100% of your frontend code and API responses can be read by any visitor, minified or not.

## Where it bites a vibe-coded app

You ask for a Pro-only export button. The AI writes:

```tsx
"use client";
// Runs in the visitor's browser. Anyone can flip `plan` in dev tools,
// or skip this component and call /api/export directly.
export function ExportButton({ plan }: { plan: string }) {
  if (plan !== "pro") return <UpgradePrompt />;
  return <button onClick={() => fetch("/api/export", { method: "POST" })}>Export</button>;
}
```

And the `/api/export` route exports for whoever is signed in, because "the button already checks". The fix is to keep the button (it's a fine user experience) and check on the server, using the plan from your database, never from the request:

```ts
export async function POST() {
  const user = await requireUser();              // verified session, or 401
  const plan = await getPlanFromDatabase(user.id);
  if (plan !== "pro") return new Response("Upgrade required", { status: 403 });
  // ...do the export
}
```

## Tell your AI

```text
Find every check in this app's browser code: sign-in checks, roles, admin-only screens, paid-plan gates, ownership checks, usage limits, prices and discounts. For each one, show me the server-side or database check that enforces the same rule for the same action, with file:line. Mark any rule that is only enforced in the browser.

Then:
1. List every value the server takes from the request that it should look up itself instead: user ID, role, plan, price, owner, credits.
2. List every API response that includes fields the current user shouldn't see, even if the screen doesn't show them.
3. List all code that runs at the edge (middleware, edge functions) and flag any that queries the database more than once.
Don't change any code yet.
```

## Check your code

- [ ] Every rule shown in the browser is enforced again on the server or in the database.
- [ ] The user's ID comes from the verified session, never from the request body or URL.
- [ ] Prices, plans, roles and credits are read from your database, never from the request.
- [ ] API responses contain only fields this user is allowed to see.
- [ ] No secret sits in a public environment variable or in frontend code.
- [ ] Edge code does light work only; anything that queries the database runs in the database's region.

## Check yourself

1. Your app hides the "Delete project" button from everyone but the owner. Is that security?
2. Why can moving your API to the edge make it slower?
3. Your team page only shows members' names, but the API returns their full profiles, including email addresses. Is that a problem if nobody can see the emails on screen?

**Answers**

1. No, it's convenience. Anyone can call the delete endpoint directly, so the server must check that the caller owns that project.
2. Your database is still in one region. Every query from the edge travels the full distance, so code that queries several times waits longer than it would on a server next to the database.
3. Yes. Every API response is visible in the browser's Network tab. Return only the fields the screen needs.

## Go deeper

- [OWASP Top 10: Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/): the most common serious web vulnerability, with examples.
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (Next.js docs): which code runs where in a Next.js app.
