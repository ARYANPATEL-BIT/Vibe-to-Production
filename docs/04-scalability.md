# 04 · Scalability

Honest framing first: **you do not need microservices, Kubernetes or a "scalable architecture" to launch.** A single well-built app on managed services handles tens of thousands of users. Instagram ran on a handful of servers when it was acquired.

What kills early apps is not architecture. It's a few specific mistakes that work fine with 10 test rows and fall over at 10,000 real ones. AI writes every one of these by default. Fix them and you're ready for 100x your current traffic.

## The six things that actually break

### 1. Loading everything

```ts
// Works with 20 rows. Times out with 200,000.
const { data } = await supabase.from("orders").select("*");
```

**Rule:** every list query has a `limit` and pagination. Select only the columns you need instead of `*`. Never load a whole table to count it or filter it in JavaScript; let the database do it.

### 2. Missing indexes

Without an index, the database reads every row to find yours. Fast at 1,000 rows, painfully slow at 1,000,000.

**Rule:** add an index for every column you filter or sort by in a common query, especially foreign keys like `user_id`. The template's migration indexes `(user_id, created_at desc)` because that's exactly what the dashboard asks for.

**Check:** Supabase dashboard → Advisors (performance) and Query Performance show slow queries and missing indexes.

### 3. The N+1 query

```ts
// 1 query for posts + 1 query PER post for its author = 101 queries for 100 posts
for (const post of posts) {
  post.author = await getUser(post.authorId);
}
```

**Rule:** fetch related data in one query (a join, or `select("*, author:profiles(name)")` in Supabase), or fetch all the IDs at once with `in`. Never put a database call inside a loop.

### 4. Slow work inside the request

Sending emails, calling AI models, resizing images, generating PDFs, calling slow third-party APIs: if these happen while the user waits, your app is only as fast and reliable as the slowest one. On serverless hosts, functions also have time limits.

**Rule:** if it takes more than about a second or might fail and need a retry, move it to a background job. Free-tier options: Inngest, Trigger.dev, Upstash QStash, or Supabase Queues/pg_cron. The request just records "do this" and returns immediately.

### 5. Database connections on serverless

Every serverless function instance can open its own database connection. A traffic spike opens hundreds and your database refuses new ones.

**Rule:** if you connect to Postgres directly (Prisma, Drizzle, raw SQL), use your provider's connection pooler URL (on Supabase, the transaction pooler). The Supabase JS client talks over HTTP and doesn't have this problem.

### 6. Unbounded costs

Scaling isn't just "does it stay up?" It's "does it stay affordable?" Things that grow with usage: AI API calls, email/SMS, file storage and bandwidth, function execution time, database size.

**Rule:**
- Know your cost per active user. Put it in `SPEC.md`.
- Set spending caps and budget alerts in every provider.
- Make sure what you charge grows with what you spend: if heavy users cost you 50x more, you need usage limits or usage-based pricing.
- Watch your free tiers: know which limit you'll hit first and what it costs to go past it.

## Cheap wins

- **Cache public pages.** Marketing pages, blog posts and docs should be static or cached at the CDN. Only pages showing personal data need to be generated per request.
- **Optimize images.** Use your framework's image component or a CDN that resizes. A 4 MB hero image is the most common reason a "fast" app feels slow.
- **Set timeouts** on every outbound call (AI, payments, third-party APIs) so one slow service doesn't hang your whole app.
- **Put limits on user input.** Max lengths on text fields, max file sizes, max items per request.

## Load testing (when you have something to protect)

Before a launch you expect to spike (Product Hunt, a big newsletter, a paid campaign), simulate it:

- Use [k6](https://k6.io) (free, open source) to hit your main pages and API routes with a few hundred virtual users **against a staging environment**, never production.
- Watch: response times, error rate, database CPU, and whether rate limits trigger as expected.
- Ask your AI to write the k6 script from your list of key user flows.

## Done when

- [ ] Every list query is limited and paginated; no `select *` on large tables
- [ ] Indexes exist for every common filter/sort, including foreign keys
- [ ] No database queries inside loops
- [ ] Emails, AI calls and other slow work run in background jobs or have timeouts
- [ ] Direct Postgres connections use the pooler
- [ ] Cost per active user is known; spending caps and budget alerts are set
- [ ] Public pages are cached; images are optimized
- [ ] (Before a big launch) a load test against staging passed
