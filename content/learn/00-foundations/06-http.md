---
title: "HTTP"
description: "The language of the web: methods, status codes, headers, cookies and caching, why every request stands alone, and what HTTP/2 and HTTP/3 change."
level: foundation
---

## What it is

HTTP (Hypertext Transfer Protocol) is the language browsers, apps and servers use to talk. The client sends a **request** (what it wants), and the server sends back a **response** (what happened, and the data). Both carry **headers**, labelled lines of extra information, and often a **body**, the actual content. HTTP is **stateless**: every request stands alone, and the server remembers nothing between them unless the request reminds it.

## Why it matters

Most of HTTP is handled for you, but a few choices are yours, and AI tools get them wrong in ways that hurt:

- The wrong **method** lets link previews, browser prefetching or a hidden image tag trigger an action.
- The wrong **status code** hides errors from your monitoring and confuses retries.
- Missing **cookie** settings make sessions easier to steal.
- The wrong **caching** header can make a CDN save one user's private page and serve it to everyone else.

## How it works

A real request and response, as text:

```text
POST /api/notes HTTP/1.1
Host: app.example.com
Cookie: session=eyJhbGciOi...
Content-Type: application/json

{"title": "Groceries"}

HTTP/1.1 201 Created
Content-Type: application/json
Cache-Control: private, no-store

{"id": "n_123", "title": "Groceries"}
```

The first line of the request is the **method** and the **path**. The method says what kind of action this is:

| Method | Means | Safe to repeat? |
|---|---|---|
| `GET` | Read something. Must not change anything | Yes, and caches may store it |
| `POST` | Create something or do an action | No: twice can mean two orders |
| `PUT` | Replace something with this version | Yes: twice gives the same result |
| `PATCH` | Change part of something | Depends on the change |
| `DELETE` | Remove something | Yes: it's gone either way |

"Safe to repeat" has a name, **idempotent**: doing it twice leaves things the same as doing it once. Networks retry, users double-click, and webhooks get delivered twice, so this matters more than it sounds.

The first line of the response is the **status code**, a number in one of five families:

| Code | Means | Use it when |
|---|---|---|
| `200` OK, `201` Created, `204` No Content | It worked | Success |
| `301`, `308` | Moved for good | A page moved permanently |
| `302`, `307` | Look over there for now | Redirect after login |
| `400` Bad Request, `422` | The input is wrong | Validation failed |
| `401` Unauthorized | Who are you? | No valid session |
| `403` Forbidden | I know who you are; you can't do this | Signed in, not allowed |
| `404` Not Found | Doesn't exist, or you mustn't know it does | Missing, or someone else's record |
| `409` Conflict | Clashes with the current state | Duplicate, or edited by someone else |
| `429` Too Many Requests | Slow down | Rate limit hit |
| `500` | The server broke | A bug |
| `502`, `503`, `504` | Something behind the server broke or timed out | A dependency is down or slow |

**Headers** you'll meet most often: `Content-Type` (what format the body is in), `Cache-Control` (who may store this response, and for how long), `Location` (where a redirect goes), `Authorization` (a token, for API clients), and the cookie pair.

**Cookies** are how a stateless protocol remembers you. The server sends `Set-Cookie` once; the browser sends that cookie back on every later request to the same site. The server then verifies it each time. Its attributes decide how safe it is:

```text
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

- `HttpOnly`: page JavaScript can't read it, so injected script can't steal it.
- `Secure`: only sent over HTTPS.
- `SameSite=Lax`: not sent on most requests started by other sites, which blocks most cross-site request forgery (another site making your browser act on your behalf).

Statelessness is also why serverless works: any copy of your code can handle any request, because everything it needs arrives with the request.

**Versions.** HTTP/1.1 handles one request at a time per connection, so browsers open several connections in parallel. HTTP/2 sends many requests at once over one connection. HTTP/3 does the same over QUIC on UDP ([IP, TCP, UDP and ports](./05-ip-tcp-udp-and-ports.md)), so a lost packet only stalls the request it belongs to and connecting takes fewer round trips. Your host or CDN picks the version; your code looks the same either way.

## Trade-offs

Where a browser app keeps its sign-in proof:

| | `HttpOnly` cookie | Token in `localStorage` |
|---|---|---|
| Readable by injected JavaScript | No | Yes: one XSS bug leaks every session |
| Sent automatically | Yes, so you need `SameSite` against forgery | No, your code adds it to each request |
| Works for mobile apps and other APIs | Awkward | Easy |
| Default in most auth libraries for web apps | Yes | Less often |

## Numbers to remember

- Status families: 2xx worked, 3xx go elsewhere, 4xx the client's fault, 5xx the server's fault.
- Browsers open about 6 HTTP/1.1 connections per site at once. HTTP/2 and HTTP/3 need just one.
- Browsers allow about 4 KB per cookie, and every cookie is sent with every request to its site, so keep them small.
- `Cache-Control: max-age=31536000` (one year) is the standard for files whose names change when their content does, like `app.3f9a1c.js`.

## Where it bites a vibe-coded app

The dashboard API is slow, so you ask the AI to "add caching". It writes:

```ts
// The CDN now saves the first visitor's dashboard and serves that same
// response to everyone who asks in the next 60 seconds.
return Response.json(dashboardData, {
  headers: { "Cache-Control": "public, s-maxage=60" },
});
```

`public` and `s-maxage` tell shared caches, including your CDN, that they may store this response and hand it to anyone. For a response built from someone's cookie, that leaks one user's data to others. Personal responses get `Cache-Control: private, no-store`. Cache at the CDN only what's identical for every visitor, and speed up personal pages with the fixes in [Latency and bandwidth](./08-latency-and-bandwidth.md) instead.

## Tell your AI

```text
List every API route and server action in this app as a table: method, path, the status codes it can return, the Cache-Control header it sends, and any cookies it sets with their attributes.

Flag:
1. Any GET request that changes data.
2. Any error returned with status 200.
3. Any response built from the user's session or cookie that a shared cache or CDN could store (public, s-maxage, or framework caching on a personal route).
4. Any cookie holding a session or token without HttpOnly, Secure and SameSite.
5. Any POST that would do harm if it ran twice (payments, emails, credits) and has no protection against duplicates.
Don't change any code yet.
```

## Check your code

- [ ] `GET` never changes data; actions use `POST`, `PATCH` or `DELETE`.
- [ ] Errors return 4xx or 5xx codes, not 200 with an error message inside.
- [ ] 401 means "not signed in", 403 means "not allowed"; someone else's record returns 404.
- [ ] Personal responses send `Cache-Control: private, no-store`.
- [ ] Session cookies are `HttpOnly`, `Secure` and `SameSite=Lax` or `Strict`.
- [ ] Actions that move money or send messages are safe to receive twice.

## Check yourself

1. Why is `GET /api/delete-account` a bad idea, even if it checks who's signed in?
2. What's the difference between a 401 and a 403?
3. If HTTP is stateless, how does the server know you're signed in on your tenth click?

**Answers**

1. Browsers, link previews and crawlers send `GET` requests freely, and another site can make your browser send one with an image tag. Cookies go along with it, so the account gets deleted without the user meaning to.
2. 401 means the server doesn't know who you are. 403 means it knows, and the answer is no.
3. The browser sends the session cookie with every request, and the server verifies it each time. Nothing is remembered between requests; the proof travels with each one.

## Go deeper

- [An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) (MDN): requests, responses and how they fit together.
- [Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) (MDN): every cookie attribute and what it protects against.
- [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) (MDN): the full list with when to use each.
