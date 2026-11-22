---
title: "What happens when you open a URL"
description: "The whole trip from typing a web address to seeing the page: DNS, connecting, encryption, the request, your server, the database and back, and where the time goes."
level: foundation
---

## What it is

A URL (a web address, like `https://app.example.com/dashboard`) is a set of directions: which protocol to speak (`https`, a set of rules both sides agree on), which computer to find (`app.example.com`), and what to ask it for (`/dashboard`). When you press Enter, the browser finds the computer, connects to it, makes the connection private, asks for the page and draws what comes back. It's like posting a letter: look up the address, deliver it, check who answers is who they claim, hand over the request, carry the reply home.

Every other lesson in this part zooms into one step of that trip. This one is the map.

## Why it matters

Each step costs time, and most of them can fail.

When an app feels slow, the cause is rarely slow code. It's usually a step that happens too often or too far away: ten database queries one after another, or a server on a different continent from its database. When an app is down, it's usually one step failing: an expired certificate, a domain pointing at the wrong place, a database refusing connections.

Knowing the steps lets you ask your AI "which step is slow, and how many times does it happen?" instead of "make it faster".

## How it works

```text
             1. DNS: "where is app.example.com?"
  Browser  ---------------------------------------->  DNS resolver
     |     <----------------- "76.76.21.21" --------
     |
     |  2. TCP: open a connection to 76.76.21.21, port 443
     |  3. TLS: check the certificate, agree on encryption keys
     |  4. HTTP: GET /dashboard, plus the cookie that says who you are
     v
  CDN edge  ----- public file it already has? ----->  answers straight away
     |
     |  personal page, or not cached
     v
  Your server  (checks who you are, runs your code)
     |
     |  query
     v
  Database  (returns the rows)

  The page travels back the same way. The browser then asks for the
  CSS, JavaScript, fonts and images the page mentions, and draws it.
```

1. **Find the computer.** Computers on the internet are found by IP address, a number like `76.76.21.21`. The browser asks DNS (the Domain Name System, the internet's phone book) which address the name points to. Answers are saved for a while, so repeat visits skip this. See [DNS](./04-dns.md).
2. **Connect.** The browser opens a TCP connection to that address on port 443, the numbered door used for HTTPS. See [IP, TCP, UDP and ports](./05-ip-tcp-udp-and-ports.md).
3. **Make it private.** TLS is the encryption, the "S" in HTTPS. The server shows a certificate proving it is `app.example.com`, and both sides agree on keys. See [HTTPS and TLS](./07-https-and-tls.md).
4. **Ask.** The browser sends an HTTP request: a method (`GET` means "give me"), the path, and headers, labelled extra lines such as the cookie that identifies you. See [HTTP](./06-http.md).
5. **Answer.** Often a CDN (content delivery network: servers worldwide holding copies of your public files) receives it first and answers from nearby if it has a copy. If not, the request goes to your server, which runs your code and queries the database. See [Clients and servers](./02-clients-and-servers.md) and [Where code runs](./03-where-code-runs.md).
6. **Draw.** The browser reads the HTML (the page's structure), then fetches the CSS (styling), JavaScript (behaviour) and images it references over the same connection. Your JavaScript may then call your API for more data.

The unit that matters is the **round trip**: a message going there and the reply coming back. Distance sets most of its length. A first visit spends several before the first byte of the page arrives:

```text
  Server 80 ms away (one round trip = 80 ms), first visit, TLS 1.3, DNS cached

  TCP connect     [ 80 ms ]
  TLS handshake             [ 80 ms ]
  HTTP request                        [ 80 ms + time your code takes ]
                  ------------------------------------------------------
                  240 ms + your code, before the first byte of the page
```

[Latency and bandwidth](./08-latency-and-bandwidth.md) covers why distance dominates, and [Back-of-the-envelope math](./09-back-of-the-envelope-math.md) shows how to add these costs up for your own app.

## Trade-offs

Where a page gets built decides how many of these steps a visitor pays for.

| Where the page comes from | Speed | Always up to date? | Cost as traffic grows | Use it for |
|---|---|---|---|---|
| Cached at the CDN | Fastest: answered near the visitor | No, until the copy expires or you redeploy | Very low | Landing page, pricing, docs, blog |
| Built by your server on each request | One trip to your server, plus its database queries | Yes | Grows with every visit | Dashboards, anything personal |
| Built in the browser from API calls | Empty shell first, then more round trips for the data | Yes | Grows with every API call | Very interactive screens after login |

## Numbers to remember

- Light in fibre covers about 200,000 km per second, so every 1,000 km between two machines adds about 10 ms to a round trip. That's the physical minimum; real routes are longer and slower.
- Rough round trips: same data centre, under 1 ms. Across a continent, 30–80 ms. Across an ocean, 70–150 ms. The other side of the world, 200–300 ms.
- With TLS 1.3, a new HTTPS connection costs about 3 round trips before the first byte: TCP 1, TLS 1, the request 1. TLS 1.2 adds one more, and DNS comes on top if it isn't cached. HTTP/3 merges the connection and TLS steps, so it's about 2. A connection that's already open costs 1.
- From Jakob Nielsen's response-time research: under about 100 ms feels instant. Around 1 second, people notice the wait but keep their train of thought.
- Google's "good" threshold for Largest Contentful Paint (LCP), the moment the main content appears, is 2.5 seconds.

## Where it bites a vibe-coded app

You create a Supabase project and pick Frankfurt because you're in Europe. You deploy to Vercel, which runs server code in Washington, D.C. (`iad1`) unless you change it. Every database query now crosses the Atlantic, at around 90 ms per round trip.

Then the AI writes the dashboard like this:

```ts
// Three round trips, one after another: about 270 ms of travel alone.
const profile = await supabase.from("profiles").select("name").eq("id", userId).single();
const orders = await supabase.from("orders").select("id, total").eq("user_id", userId).limit(20);
const plan = await supabase.from("subscriptions").select("plan").eq("user_id", userId).single();
```

Each query is fine. The page is slow because of where the code runs and the order the queries run in. Two small fixes:

- Run queries that don't depend on each other together, with `Promise.all`. Three round trips become one.
- Put your server in your database's region: Vercel project → Settings → Functions, or in `vercel.json`:

```json
{ "regions": ["fra1"] }
```

Now each query takes a few milliseconds instead of 90.

## Tell your AI

```text
Trace what happens when someone opens [the page you care about, e.g. /dashboard] in this app, from the DNS lookup to the last image. For each step, say where it runs (browser, CDN, server or database) and whether it could be cached.

Then:
1. List every database query and external API call the server makes to build this page, in order. Mark which ones wait for the one before.
2. Tell me which region the server code runs in and which region the database is in, and how you know. If they differ, estimate the milliseconds that adds per query.
3. Tell me which pages in this app could be served from the CDN instead of being built on every request.
4. Suggest the smallest changes that remove round trips. Don't change any code yet.
```

## Check your code

- [ ] Server code and database are in the same region. Check both dashboards, not just the code.
- [ ] Queries that don't depend on each other run together (`Promise.all`), not one `await` after another.
- [ ] No database or API call sits inside a loop.
- [ ] Public pages (landing, pricing, blog, docs) are static or cached at the CDN.
- [ ] A page doesn't make five separate calls to your API on load when one would do.

## Check yourself

1. Your landing page loads instantly, but your dashboard takes two seconds. Which steps are different between them?
2. Why is a first visit to a site slower than the second, even when nothing on the page changed?
3. Your server is in Washington and your database is in Frankfurt. A page runs four queries one after another. Roughly how much time does distance alone add?

**Answers**

1. The landing page is probably served by the CDN, near the visitor. The dashboard is personal, so every request goes to your server, then to the database once per query.
2. The first visit pays for DNS, TCP and TLS, and downloads every file. The second reuses the saved DNS answer, often an open connection, and files already in the browser's cache.
3. About 4 × 90 ms, roughly 360 ms before the database does any work. If they don't depend on each other, running them together cuts that to about 90 ms; moving the server next to the database, to a few milliseconds.

## Go deeper

- [How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works) (MDN): the same trip in a little more detail.
- [How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work) (MDN): what happens after the HTML arrives.
- [What happens when...](https://github.com/alex/what-happens-when): the deep version, from key press to pixels.
