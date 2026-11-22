---
title: "Latency and bandwidth"
description: "Why most slowness comes from round trips multiplied by distance rather than slow code or a thin connection, and where to put your server, database and files."
level: foundation
---

## What it is

**Latency** is how long one message takes to get from one place to another. **Bandwidth** is how much data can flow per second once it's moving. On a motorway, latency is how long the drive takes and bandwidth is how many lanes there are: more lanes move more cars, but they don't make the journey shorter. A **region** is a cluster of data centres in one area, such as `us-east-1` in Virginia or `fra1` in Frankfurt, and it's where your server and database actually sit.

## Why it matters

Most web pages are slow because of latency, not bandwidth. A page that makes ten round trips one after another, each crossing an ocean, takes over a second no matter how fast anyone's internet is. Upgrading your plan or the user upgrading theirs won't touch it.

Latency multiplies. Distance between visitor and server is paid once per request; distance between server and database is paid once per query, and a page can run dozens. The first is set by where your users are. The second is entirely your choice, and it's where vibe-coded apps lose the most time.

## How it works

A rough model for how long anything on the network takes:

```text
  time  =  round trips x round-trip time  +  data size / bandwidth  +  work
           (latency: usually the big one)    (bandwidth)               (your code,
                                                                        the database)
```

[What happens when you open a URL](./01-what-happens-when-you-open-a-url.md) counted the round trips to open a connection. The rest come from your own code, and their cost depends on what's far from what:

```text
  Good: server next to database          Bad: server far from database

  visitor                                visitor
     |  1 long trip                         |  1 long trip
     v                                      v
  server                                 server
     |  5 queries x 1 ms                    |  5 queries x 90 ms
     v                                      v
  database                               database

  = 1 long trip + 5 ms                   = 1 long trip + 450 ms
```

So the placement rules are:

1. **Put the database where most of your users are.** It's the hardest thing to move later.
2. **Put your server in the same region as the database.** Always. A visitor 100 ms away pays that once; a query 100 ms away pays it every time.
3. **Put public files on a CDN**, so images, scripts and styles come from near each visitor.
4. **Cut round trips before anything else.** Run independent queries at the same time, fetch related data in one query (a join), and build pages on the server rather than making the browser fetch piece by piece.

Bandwidth matters for big things: images, video, large JavaScript bundles. Network speeds are quoted in **bits** per second, files in **bytes**, and a byte is 8 bits. A 10 Mbps connection moves about 1.25 MB per second.

A new connection also starts slowly. TCP doesn't know how fast the path is, so it sends a little, waits for the reply, then doubles what it sends: its **slow start**. A large file over a fresh connection costs several extra round trips, which is why small first pages and compressed files load disproportionately faster.

Finally, look at the slow requests, not the average. The **p95** is the time that 95% of requests beat; the slowest 5% are slower. An average of 120 ms can hide a p95 of two seconds, and those users are the ones who complain.

## Trade-offs

| Setup | Speed for nearby users | Speed for far-away users | Complexity | When it's worth it |
|---|---|---|---|---|
| One region for server and database, CDN for files | Fast | One long trip per request; fine for most apps | Low | Almost always, to start |
| Server at the edge, database in one region | Fast for pages without data | Slower for pages with several queries | Medium | Mostly static sites with light personalisation |
| Database copies in several regions | Fast | Fast for reads | High: copies lag, writes still go to one place | Real users on several continents, after you've measured |

## Numbers to remember

- Same data centre: well under 1 ms. Same region, across its data centres: a millisecond or two. For long distances, see the round trips in [What happens when you open a URL](./01-what-happens-when-you-open-a-url.md).
- TCP's first round trip on a new connection carries about 14 KB, then roughly doubles each round trip.
- 8 bits = 1 byte. A 100 Mbps connection moves about 12.5 MB per second at best.
- A 1 MB file over a 10 Mbps mobile connection takes nearly a second on bandwidth alone.
- Watch p95 and p99 response times, not averages.

## Where it bites a vibe-coded app

The browser often makes a waterfall of requests, each waiting for the last. AI tools write this pattern all the time:

```tsx
// Each step starts only when the previous one finishes, and the last
// step fires one more request per project.
useEffect(() => {
  fetch("/api/me").then((r) => r.json()).then((me) => {
    setMe(me);
    fetch("/api/projects").then((r) => r.json()).then((projects) => {
      setProjects(projects);
      projects.forEach((p) => fetch(`/api/projects/${p.id}/tasks`));
    });
  });
}, []);
```

For a visitor 150 ms away, that's at least three round trips in a row, around 450 ms, before tasks start to appear. Each of those requests then runs its own queries on the server. With 20 projects it's 22 requests for one screen.

The fix is one request: an endpoint (or a server-rendered page) that returns what this screen needs, built on the server with a single query that joins projects and tasks. The server is next to the database, so the extra work costs milliseconds instead of round trips. The same pattern on the server, a query inside a loop, is the N+1 problem in [Scalability](../../ship/04-scalability.md).

## Tell your AI

```text
For [the slowest page in this app, e.g. /dashboard]:

1. List every request the browser makes when the page loads, in order, and mark which ones wait for another to finish.
2. For each request, list the database queries and external API calls the server makes, and mark any that run one after another but don't depend on each other, or run inside a loop.
3. Tell me which region the server code and the database each run in, and how you know.
4. Estimate the total waiting time for a visitor 150 ms away, showing your working.
5. Propose the smallest changes that cut round trips: combining requests, fetching on the server, running queries together, joins instead of loops.
6. List the five largest files the page downloads.
Don't change any code yet.
```

## Check your code

- [ ] Server code runs in the same region as the database.
- [ ] Each screen loads its data in one or two requests, not a chain.
- [ ] No request or query is made inside a loop, in the browser or on the server.
- [ ] Independent queries run at the same time.
- [ ] Images are resized and compressed; nothing over a few hundred KB loads above the fold.
- [ ] In the browser's Network tab, the waterfall for the main page has no long staircase of requests.

## Check yourself

1. You upgrade your office internet from 100 Mbps to 1 Gbps, and the dashboard loads no faster. Why?
2. Most of your users are in India. Where should your database go, and where should your server go?
3. Your monitoring shows an average response time of 120 ms, but users say the app is slow. What should you look at?

**Answers**

1. The dashboard's time is mostly round trips, which are set by distance, not bandwidth. More lanes don't shorten the drive.
2. The database in a region in or near India, and the server in the same region as the database. Public files go on a CDN.
3. The p95 and p99 response times, and which requests make them up. The average hides the slowest requests.

## Go deeper

- [Primer on latency and bandwidth](https://hpbn.co/primer-on-latency-and-bandwidth/) (High Performance Browser Networking): where every millisecond goes, from the speed of light to the last mile.
- [Time to First Byte](https://web.dev/articles/ttfb) (web.dev): how to measure the server's part of a page load, and what counts as good.
- [Configuring regions for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/region) (Vercel docs): how to put your server next to your database on one popular host.
