---
title: "DNS"
description: "How a name like example.com becomes an address a computer can reach, which records your site and email need, and why changes take time to spread."
level: foundation
---

## What it is

DNS (the Domain Name System) turns names people can remember, like `app.example.com`, into IP addresses computers use to find each other, like `76.76.21.21`. It's the internet's phone book, spread across millions of servers that each know a small part of it and save answers for a while. A **registrar** is the company you bought the domain from; a **DNS provider** is whoever answers questions about it. They can be the same company or different ones.

## Why it matters

Your domain is part of your production. If its records are wrong, your site is unreachable and your email bounces or lands in spam, even though your code is fine. Magic-link sign-in depends on email arriving, so a missing email record can stop people logging in at all.

DNS also has a security side. Whoever controls your registrar account can point your domain anywhere, including a copy of your login page. And a record left pointing at a service you've stopped using can let a stranger claim that service and serve their content on your subdomain (a **subdomain takeover**).

## How it works

```text
  Browser: "where is app.example.com?"
     |
     v
  Resolver (your ISP's, or a public one like 1.1.1.1 or 8.8.8.8)
     |  already has a saved answer? reply now, done.
     |
     |  not saved:
     +--> root servers:          "for .com, ask the .com servers"
     +--> .com servers:          "for example.com, ask ns1.your-dns-provider.com"
     +--> your DNS provider:     "app.example.com is 76.76.21.21, keep it 300 s"
     |
     v
  Browser connects to 76.76.21.21.
  The resolver and the browser both save the answer for 300 seconds.
```

A **resolver** does the looking up on your behalf. It asks the root servers, which point to the servers for `.com`, which point to your DNS provider, which holds your actual records. Each answer comes with a **TTL** (time to live): how many seconds anyone may keep using it before asking again.

Your records are the lines you add in your DNS provider's dashboard:

| Type | What it says | Example |
|---|---|---|
| `A` | This name is at this IPv4 address | `example.com` → `76.76.21.21` |
| `AAAA` | This name is at this IPv6 address | `example.com` → `2001:db8::1` |
| `CNAME` | This name is an alias for another name | `www` → `cname.vercel-dns.com` |
| `MX` | Email for this domain goes to these servers | `example.com` → your email provider |
| `TXT` | Free text, used for proofs and email rules | SPF, DKIM, DMARC, domain verification |

A `CNAME` can't sit on the bare domain (`example.com` itself, called the apex), because the DNS rules forbid it alongside the other records the apex needs. Hosts work around this with `A` records or a provider feature usually called ALIAS, ANAME or CNAME flattening.

"DNS propagation" isn't a process that pushes your change around the world. It's saved answers expiring. After you change a record, each resolver keeps serving the old answer until its saved copy's TTL runs out, so different people see different versions for a while.

Email gets three `TXT` records that receiving servers check to decide whether a message really came from you:

- **SPF** lists which services may send mail for your domain.
- **DKIM** publishes a key; your email provider signs each message, and receivers check the signature.
- **DMARC** tells receivers what to do when a message fails those checks, and where to send reports.

## Trade-offs

| Choice | Upside | Downside |
|---|---|---|
| Short TTL (300 s) | Changes take effect within minutes | More lookups, so a few more slow first visits |
| Long TTL (a day) | Fewer lookups; keeps working briefly if your DNS provider has an outage | A mistake takes up to a day to undo everywhere |
| DNS at your registrar | One account, one bill | Registrar DNS dashboards are often basic |
| DNS at your host or a dedicated provider | Better tools, faster answers, one-click records | One more account that controls production |

## Numbers to remember

- An uncached lookup usually takes tens of milliseconds; a cached one is close to instant.
- Common TTLs run from 300 seconds (5 minutes) to 86,400 (a day). Before moving your site, lower the TTL to 300 and wait at least one old TTL before making the switch.
- Gmail requires SPF or DKIM from every sender, and SPF, DKIM and DMARC from anyone sending more than 5,000 messages a day to Gmail accounts. Unauthenticated mail may be marked as spam or rejected.
- Domains renew yearly. When one expires, your site and your email stop working together.

## Where it bites a vibe-coded app

You ask the AI to add magic-link sign-in. It wires up Supabase Auth with a custom SMTP sender or an email API, writes the code, and the test email arrives in your own inbox. It never mentions DNS, because DNS isn't in the code.

Without SPF, DKIM and DMARC on the sending domain, real users' sign-in emails land in spam or never arrive, and they can't log in. Nothing in your logs says why. The records come from your email provider's dashboard and look roughly like this:

```text
send.example.com.          TXT  "v=spf1 include:<your provider's SPF domain> ~all"
<selector>._domainkey      TXT  "p=<public key from your provider>"
_dmarc.example.com.        TXT  "v=DMARC1; p=none; rua=mailto:dmarc@example.com"
```

Start DMARC at `p=none` to collect reports, then move to `quarantine` once everything legitimate passes. On Windows you can check a record with `nslookup -type=TXT _dmarc.example.com`.

## Tell your AI

```text
List every domain and subdomain this app depends on: the site, any API or app subdomain, auth redirect and callback URLs, and the domain emails are sent from.

For each, tell me which DNS records it needs (type, name, and where the value comes from), and give me the nslookup commands to check they exist. For the email sending domain, confirm SPF, DKIM and DMARC are covered and tell me which provider dashboard gives me the values.

Also check that the auth provider's site URL and allowed redirect URLs match the real production domain, not localhost or a preview URL. Don't change any code yet.
```

## Check your code

- [ ] The auth provider's site URL and redirect URLs use the production domain.
- [ ] The domain you send email from has SPF, DKIM and DMARC records, and your provider shows it as verified.
- [ ] No DNS record points at a project, app or bucket you've deleted.
- [ ] Your registrar account has multi-factor authentication, auto-renew and the registrar lock turned on.
- [ ] Before a migration, the TTL was lowered at least one old TTL in advance.

## Check yourself

1. You changed your `A` record an hour ago. You see the new site; your cofounder still sees the old one. What's going on?
2. Why can a forgotten `CNAME` be a security problem?
3. Users say sign-in emails never arrive, but yours do. Which DNS records do you check first?

**Answers**

1. Their resolver saved the old answer and will keep using it until its TTL expires. Nothing is broken; the old TTL was just long.
2. If it points at a service you no longer use, someone else can sign up for that service, claim the same name and serve their content on your subdomain, with your domain's credibility.
3. SPF, DKIM and DMARC on the sending domain. Your own inbox may be more forgiving, or have learned to trust you.

## Go deeper

- [What is a domain name?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name) (MDN): domains, registrars and how a name is structured.
- [Email sender guidelines](https://support.google.com/a/answer/81126) (Google): what Gmail requires before it delivers your mail.
- [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034): the original design of DNS, still the foundation.
