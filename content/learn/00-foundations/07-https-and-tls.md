---
title: "HTTPS and TLS"
description: "How HTTPS keeps traffic private and proves who the server is, what certificates are and why they expire, and the one-line \"fix\" that quietly switches the protection off."
level: foundation
---

## What it is

HTTPS is plain [HTTP](./06-http.md) sent inside TLS (Transport Layer Security), an encryption layer. TLS gives three guarantees: nobody on the network can read the traffic, nobody can change it on the way without being detected, and the server has proved it really owns the domain. The proof is a **certificate**: a file signed by a certificate authority (CA), a company browsers trust, that says "this key belongs to app.example.com until this date".

## Why it matters

Without HTTPS, anyone on the same café Wi-Fi, or any network in between, can read passwords and session cookies and change pages as they pass. Browsers mark such sites "Not secure", and many features, including `Secure` cookies, only work over HTTPS.

Certificates also expire. When one does, every visitor gets a full-page warning, which is as good as being down.

And HTTPS has limits worth knowing. The padlock means the connection is private and the server owns the name. It says nothing about whether the site is honest or your code is safe. Phishing sites have padlocks too.

## How it works

The TLS 1.3 handshake happens right after the TCP connection opens ([IP, TCP, UDP and ports](./05-ip-tcp-udp-and-ports.md)):

```text
  Browser                                              Server
     | -- hello: TLS versions I speak, my key share ----> |
     |                                                    |
     | <-- hello: chosen settings, its key share,         |
     |     certificate, signature, "finished" ----------- |
     |                                                    |
     |  browser checks the certificate:                   |
     |  - is it for app.example.com?                      |
     |  - is it still in date?                            |
     |  - does it chain up to a CA I trust?               |
     |                                                    |
     | -- "finished" + the first encrypted request -----> |
     |                                                    |
     1 round trip, then everything is encrypted
```

Both sides combine their key shares into a secret only they know, even though every message was visible on the network. The certificate proves the other end isn't an impostor in the middle.

The **chain** works like references. Your certificate is signed by an intermediate certificate, which is signed by a root certificate that ships inside every browser and operating system. The browser follows the signatures up to a root it already trusts.

Where it happens in a typical app:

```text
  browser ==TLS==> CDN / host ---> your code ==TLS==> database, Stripe, AI API
           ^                                   ^
           host manages this certificate       your code must check these
```

Your host (Vercel, Netlify, Render, Cloudflare) usually ends the TLS connection from visitors and renews that certificate automatically. The connections your code opens to other services are your job: they should use TLS, and your code should check the certificate.

**HSTS** (HTTP Strict Transport Security) is a response header telling the browser to only ever use HTTPS for your domain, so nobody can quietly downgrade a visitor to plain HTTP. It's one of the headers in the [security guide](../../ship/02-security.md#8-security-headers).

## Trade-offs

| Option | Work for you | Cost | Watch out for |
|---|---|---|---|
| Certificate managed by your host | None: issued and renewed automatically | Free | The custom domain's DNS must point at the host so it can prove ownership |
| Let's Encrypt on your own server | Install a renewal tool once | Free | Renewal must be automatic and monitored |
| Paid certificate from a commercial CA | Buy, install and renew by hand or with tools | Money | Browsers no longer show any special badge for paid certificates |
| CDN in front, "Flexible" mode (Cloudflare) | None | Free | Visitor to CDN is encrypted, CDN to your server is not. Use Full (strict) |

## Numbers to remember

- TLS 1.3 costs 1 round trip to set up; TLS 1.2 costs 2. Resumed connections can skip most of that.
- Let's Encrypt certificates are valid for 90 days today, 64 days from February 2027 and 45 days from February 2028. Renew automatically, around two-thirds of the way through.
- The maximum lifetime for any publicly trusted certificate is also shrinking, to 47 days by 2029. Manual renewal is on its way out.
- Encryption itself is cheap on modern hardware. The cost of HTTPS is the handshake's round trips, not the maths.

## Where it bites a vibe-coded app

Your app connects to Postgres and fails with "self-signed certificate in certificate chain". You paste the error into the AI, and it suggests:

```ts
// The connection is still encrypted, but it no longer checks WHO is on
// the other end. Anyone in the middle can present any certificate.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
```

The error goes away and so does the authentication. A worse version is `NODE_TLS_REJECT_UNAUTHORIZED=0` as an environment variable, which switches off certificate checks for every outbound connection the process makes: Stripe, your AI provider, your email API.

The real fix: download your database provider's CA certificate (Supabase offers it in the dashboard's database settings) and pass it in as `ssl: { ca: ... }`, or use a connection string with `sslmode=verify-full`. Note that `sslmode=require` encrypts but doesn't check the certificate either.

## Tell your AI

```text
Search this codebase, its config files and its .env.example for anything that weakens TLS: rejectUnauthorized: false, NODE_TLS_REJECT_UNAUTHORIZED, sslmode=disable or sslmode=require on database URLs, verify=False, curl -k or --insecure, and any http:// URL that should be https://.

For each one, explain what it allows an attacker to do and give the proper fix (the provider's CA certificate, sslmode=verify-full, or the https URL).

Then confirm: does the app send a Strict-Transport-Security header, are session cookies marked Secure, and does plain HTTP redirect to HTTPS? Don't change any code yet.
```

## Check your code

- [ ] No `rejectUnauthorized: false` or `NODE_TLS_REJECT_UNAUTHORIZED=0` anywhere, including `.env` files and scripts.
- [ ] Database connections verify the server's certificate, not just encrypt.
- [ ] No `http://` URLs for APIs, webhooks, redirects or assets in production config.
- [ ] The `Strict-Transport-Security` header is set.
- [ ] If a CDN proxies your site, its encryption mode checks your server's certificate ("Full (strict)" on Cloudflare).
- [ ] Certificates you manage yourself renew automatically, and something alerts you if renewal fails.

## Check yourself

1. A site shows a padlock. What does that prove, and what doesn't it?
2. Why is `rejectUnauthorized: false` worse than it sounds, given the traffic is still encrypted?
3. Why do certificates managed by your host rarely expire by accident?

**Answers**

1. It proves the connection is encrypted and the server controls that domain name. It doesn't prove the site is honest, safe, or free of bugs.
2. Encryption to an unknown party isn't protection. Anyone who can intercept the connection can present their own certificate, decrypt everything, and pass it on.
3. The host renews them automatically, well before they expire, as long as your domain still points at the host.

## Go deeper

- [How it works](https://letsencrypt.org/how-it-works/) (Let's Encrypt): how a CA checks you own a domain before issuing a certificate.
- [Decreasing certificate lifetimes to 45 days](https://letsencrypt.org/2025/12/02/from-90-to-45/) (Let's Encrypt): the dates, and why renewal must be automatic.
- [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) (MDN): the HSTS header and its options.
