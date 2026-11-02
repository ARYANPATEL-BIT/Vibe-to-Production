# 06 · Observability

If you find out your app is broken from a customer's angry email, you're already late. Observability means three things: **knowing** something broke, **finding** what broke, and **seeing** how people actually use the product.

All of the below has a usable free tier.

## The minimum setup

| What | Answers | Free option |
|---|---|---|
| **Error tracking** | "What crashed, for whom, and where in the code?" | Sentry (template wires it up) |
| **Uptime monitoring** | "Is the site up right now?" | UptimeRobot, Better Stack, or Checkly free tiers |
| **Logs** | "What happened before it broke?" | Your host's log viewer (Vercel, Netlify, Railway) |
| **Product analytics** | "Are people actually using the feature?" | PostHog, Plausible (self-host) or Vercel Web Analytics |
| **Spend alerts** | "Is something about to cost me a fortune?" | Budget alerts in each provider's billing settings |

## 1. Error tracking

- Install Sentry (or similar) on **both** server and browser. Most crashes customers hit happen in the browser and never reach your server logs.
- Turn off collection of personal data by default (the template does: `dataCollection: { userInfo: false, cookies: false, httpBodies: [] }`).
- Set up an alert: email or Slack/Discord when a *new* error type appears. Not on every single error, or you'll start ignoring them.
- Upload source maps (Sentry's Next.js plugin does this when you set `SENTRY_AUTH_TOKEN`) so stack traces point to your real code, not minified gibberish.

## 2. Uptime

- Create a health endpoint that returns 200 when the app is running (template: [`/api/health`](../template/src/app/api/health/route.ts)).
- Point an uptime monitor at it and at your homepage, checking every few minutes, alerting your phone.
- Optional: a public status page (most uptime tools include one free) so customers can check before emailing you.

## 3. Logs that help

Bad log: `console.log("here")`. Good log: one JSON line with what happened and enough context to find it.

```ts
log.error("create note failed", { userId, code: error.code });
```

- Log important events: signups, payments, failed logins, permission denials, background job failures.
- Include IDs (user ID, order ID, request ID) so you can trace one user's journey.
- **Never log:** passwords, tokens, API keys, full card numbers, entire request bodies, or private message contents.
- Free hosting tiers keep logs for a short time (Vercel Hobby: 1 hour). For anything longer, send them to a log service with a free tier, or rely on Sentry for errors.

## 4. Analytics

- Track the handful of events that tell you whether the product works: signed up, completed onboarding, used the core feature, paid, churned. Not every click.
- Respect consent: in many regions (EU/UK in particular) non-essential analytics cookies need a consent banner. Cookieless analytics (Plausible, Vercel Web Analytics) avoid most of this. See [08 Legal & privacy](08-legal-and-privacy.md).

## 5. A weekly 10-minute check

Put this in your calendar:
- [ ] Sentry: any new or growing errors?
- [ ] Uptime: any outages this week?
- [ ] Provider dashboards: database size, function usage, AI spend, email volume vs. free tier limits
- [ ] Dependabot: any security update PRs waiting?
- [ ] Analytics: is the core feature being used?

## Done when

- [ ] Errors from server and browser reach your error tracker, without personal data
- [ ] You get alerted on new errors and on downtime, on your phone
- [ ] Logs are structured, include IDs, and contain no secrets
- [ ] Key product events are tracked, with consent where required
- [ ] Budget alerts are set in every paid provider
