# 01 · Plan before you prompt

Most security holes and scaling problems are decided before the first line of code: by what data you store, who can see it, and how it flows. If you skip planning, the AI makes those decisions for you, silently, and usually picks whatever is fastest to type.

Planning doesn't mean a 30-page document. It means answering the questions below in a `SPEC.md` file at the root of your project, which the AI reads before every feature.

## The one-page spec

Copy this into `SPEC.md` and fill it in. Use [`prompts/01-plan.md`](../prompts/01-plan.md) to have the AI interview you and draft it.

```markdown
# What we're building
One paragraph. Who it's for, what problem it solves.

# Users and roles
- Visitor (signed out): can …
- User: can …
- Admin: can …  (who are admins? how does someone become one?)

# Data
For each thing we store:
- Name, what fields it has
- Who owns it
- Who can READ it / CREATE it / UPDATE it / DELETE it
- Is it sensitive? (personal info, payment info, health, kids' data, private messages)

# Money
How do we charge? What does a user get when they pay? What happens when they stop paying?

# Outside services
Every third-party service we call (AI APIs, email, payments, storage).
For each: what happens if it's down? What does it cost per call? Who can trigger a call?

# Not doing (v1)
Things we're deliberately leaving out.
```

## The questions that matter most

### 1. The access table

This is the single most valuable thing you'll write. For every type of data, fill in a table like this:

| Data | Read | Create | Update | Delete |
|---|---|---|---|---|
| Profile | Owner, admins | Owner (on signup) | Owner | Owner (account deletion) |
| Post | Everyone if published, owner if draft | Signed-in users | Owner | Owner, admins |
| Invoice | Owner, admins | System only (payment webhook) | Nobody | Nobody |
| Admin flag | Owner, admins | Nobody | Admins | Admins |

Every cell becomes a database rule (see [03 Data access](03-data-access.md)). Cells that say "nobody" or "system only" matter most: they're the ones the AI will forget, letting users edit their own invoices or make themselves admin.

### 2. What's the worst thing a user could do?

Spend 10 minutes thinking like someone who wants to abuse your app. For each feature, ask:

- Can someone see **another user's** data by changing an ID in the URL?
- Can someone get the paid thing **without paying**?
- Can someone make my app **send emails, SMS or AI requests** in a loop and run up my bill?
- Can someone **upload** something harmful (huge files, malware, illegal content)?
- Can someone **spam** signups, comments or messages?
- Can someone **lock out** other users or **delete** things they don't own?

Write the answers in the spec. Each one is a rule the AI must implement.

### 3. What does each paid service cost if someone abuses it?

If your app calls an AI model per request and anyone can call that endpoint, your monthly bill is unbounded. For each paid call, decide in advance:

- Who's allowed to trigger it (signed-in only? paid users only?)
- How many times per user per minute/day
- A hard monthly spending cap in the provider's dashboard

## Choosing a stack

You don't need the "best" stack. You need one that the AI knows extremely well, with managed services that handle the hard parts (auth, database backups, hosting) for you.

| If you want… | Reasonable default | Why |
|---|---|---|
| Web app with users and data | Next.js + Supabase | Huge amount of AI training data, auth and database included, free tiers. See the [playbook](../playbooks/nextjs-supabase-vercel.md) |
| Mobile app | Expo (React Native) + Supabase | Same backend as web |
| Simple marketing site | Astro or plain Next.js, no database | Less to secure |

Avoid building your own auth, your own payment handling or your own file storage. Use managed services. Every one you build yourself is a new place to get breached.

## Done when

- [ ] `SPEC.md` exists and covers users, data, money, outside services, and non-goals
- [ ] Every data type has an access table row
- [ ] Every "worst thing a user could do" has a planned defense
- [ ] Every paid outside service has a per-user limit and a spending cap
