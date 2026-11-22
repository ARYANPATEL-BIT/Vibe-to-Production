---
title: "IP, TCP, UDP and ports"
description: "IP addresses, ports, and the two ways data travels: TCP's reliable connections and UDP's fast fire-and-forget packets, plus which addresses and ports should never be reachable."
level: foundation
---

## What it is

An **IP address** is a machine's address on a network, like `76.76.21.21`. Data doesn't travel as one piece: it's cut into **packets**, small chunks that each find their own way and may arrive late, out of order or not at all. **TCP** and **UDP** are the two main ways programs send packets: TCP builds a reliable, ordered connection, while UDP just sends and hopes. A **port** is a number that says which program on the machine the data is for. If the IP address is a building's street address, the port is the apartment number.

## Why it matters

Every port that answers on the public internet is a door someone will try. Bots scan the whole IPv4 internet constantly, so an exposed database or admin panel is found within hours, not months.

Addresses matter for security too. Some IP addresses are private: they only work inside a network, such as your host's internal services or the cloud's metadata service, which hands out credentials to the machine asking. If your server fetches URLs that users type in, a user can aim it at those private addresses and read things they never could from outside.

And TCP's reliability isn't free. Opening a connection costs a round trip, which is why reusing connections and pooling database connections matter ([Clients and servers](./02-clients-and-servers.md)).

## How it works

TCP starts with a handshake, then keeps track of every packet:

```text
  Browser                                  Server, port 443
     | ---- SYN: "can we talk?" ----------------> |
     | <--- SYN-ACK: "yes, can you hear me?" ---- |
     | ---- ACK + the first request ------------> |   1 round trip before data
     |                                            |
     | <--- packets 1, 2, 3, 4 ------------------ |
     | ---- "got 1, 2 and 4; resend 3" ---------> |   lost packets are resent,
     | <--- packet 3 ---------------------------- |   then put back in order
```

The program on each end sees a clean stream of bytes in the right order. The price is the handshake, and waiting: if packet 3 is lost, packets 4 onwards sit unread until it arrives again.

UDP has no handshake, no resending and no ordering. A lost packet is simply gone. That suits things where late is as bad as never: video calls, games, and DNS lookups (small question, small answer, just ask again if nothing comes back). HTTP/3 runs on QUIC, a protocol built on UDP that adds its own reliability, so one lost packet only holds up the request it belongs to, not every request on the connection ([HTTP](./06-http.md) explains why that helps).

A machine has 65,536 ports (0 to 65,535). Programs **listen** on one; clients connect to it. Common ones:

| Port | Used by | Should it face the internet? |
|---|---|---|
| 443 | HTTPS (and HTTP/3 over UDP) | Yes |
| 80 | Plain HTTP, only to redirect to HTTPS | Yes, redirect only |
| 22 | SSH, remote login to a server | Only if you run your own server, keys only |
| 5432 | Postgres | Avoid; restrict it if you can |
| 6543 | Supabase's connection pooler (transaction mode) | Avoid; restrict it if you can |
| 6379 | Redis | No |
| 3000 | Local development servers | No, it's your laptop |

Addresses that only make sense inside a network:

```text
  127.0.0.1         "this machine" (localhost)
  10.x.x.x          private networks
  172.16-31.x.x     private networks
  192.168.x.x       private networks, your home router
  169.254.169.254   the cloud metadata service: hands out the server's credentials
```

## Trade-offs

| | TCP | UDP | QUIC (HTTP/3) |
|---|---|---|---|
| Setup | 1 round trip, plus TLS on top | None | Connection and encryption in 1 round trip |
| Lost packets | Resent automatically | Gone | Resent, without holding up unrelated requests |
| Order | Guaranteed | Not guaranteed | Guaranteed within each request |
| Used for | Web pages, APIs, databases, email | Video calls, games, DNS | Modern browsers and CDNs |
| You choose it? | Rarely: your host and libraries decide | Rarely | Your host or CDN turns it on |

## Numbers to remember

- IPv4 has about 4.3 billion addresses, and every one of them is scanned by bots regularly. IPv6 has so many that scanning it all isn't practical.
- A TCP connection costs 1 round trip before any data moves; TLS adds more ([HTTPS and TLS](./07-https-and-tls.md)).
- Packets are usually at most about 1,500 bytes, so a 1 MB file is several hundred packets.
- Ports go from 0 to 65,535. The ones below 1,024 are reserved for well-known services.

## Where it bites a vibe-coded app

You ask for "import a recipe from a URL" or link previews. The AI writes:

```ts
// The server fetches whatever URL the user typed, and returns the result.
export async function POST(req: Request) {
  const { url } = await req.json();
  const res = await fetch(url);
  return new Response(await res.text());
}
```

A user sends `http://169.254.169.254/latest/meta-data/` or `http://localhost:6379` instead of a recipe site. Your server, which sits inside the private network, happily fetches it and hands back the answer. This is SSRF (server-side request forgery), and on some cloud setups it leaks the server's own credentials.

The fix has to survive **DNS rebinding**: the attacker's domain answers with a harmless public address the first time it's looked up and a private one the next time. Code that checks the hostname's IP and then calls `fetch(url)` looks the name up twice, so it checks one address and connects to another. So:

1. Allow only `https:` URLs.
2. Look up the hostname once yourself, and refuse the request if any address it returns is private or local.
3. Connect to that exact checked address, never the hostname again. Most HTTP clients let you pass your own DNS lookup function; have it return the checked address, so the certificate is still checked against the hostname.
4. Turn off automatic redirects (`redirect: "manual"` in `fetch`) and run the whole check again, from step 1, on every redirect, up to a small limit such as 3.
5. Set a short timeout and a maximum response size, and return only the data you extracted, never the raw response.

If you can, allow only a list of known domains. The [security guide](../../ship/02-security.md#5-input-validation-and-injection) lists SSRF with the other injection attacks.

## Tell your AI

```text
Find every place where this app's server code connects to a URL, host or IP address that comes from user input: link previews, imports, webhooks the user configures, image or file fetches, "test this URL" buttons. For each one, show me whether it:
- allows only https: URLs;
- looks up the hostname once and blocks the request if any address returned is private or local (0.0.0.0/8, 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, ::1, fc00::/7, fe80::/10, and IPv4 addresses written as IPv6, like ::ffff:127.0.0.1);
- connects to that exact checked address instead of looking the hostname up again, so DNS rebinding can't swap it;
- turns off automatic redirects and repeats the whole check on every redirect, with a limit on how many it follows;
- has a timeout and a size limit, and returns only extracted data, never the raw response.

Then list every port this app's infrastructure exposes publicly (database, Redis, admin tools, SSH) and how access to each is restricted. Tell me which of these you can't see from the code and where in which dashboard I should check. Don't change any code yet.
```

## Check your code

- [ ] Server-side fetches of user-supplied URLs allow `https:` only, look the hostname up once, refuse private and local addresses, and connect to the checked address rather than looking the name up again.
- [ ] Redirects are followed by hand, with the whole check repeated on every one, up to a small limit.
- [ ] Those fetches have a timeout and a maximum response size, and return only the data you extracted.
- [ ] The database and Redis aren't open to the whole internet, or at least require strong passwords and TLS, with network restrictions on if your provider offers them.
- [ ] No admin tool, dashboard or debug server listens on a public port.
- [ ] Nothing in production depends on `localhost` addresses copied from your laptop's `.env`.

## Check yourself

1. Why does a video call use UDP, while loading a web page uses TCP?
2. Your server fetches a URL a user typed. Why is `http://169.254.169.254` dangerous?
3. What's the difference between your database's address and its port?

**Answers**

1. In a call, a packet that arrives late is useless, so resending it only adds delay. A web page needs every byte, in order, or it's broken.
2. It's the cloud metadata service, only reachable from inside the cloud network. Your server can reach it, and on some setups it returns the credentials your server runs with.
3. The address finds the machine; the port finds the program on that machine. The same server can run Postgres on 5432 and a pooler on 6543.

## Go deeper

- [Building blocks of TCP](https://hpbn.co/building-blocks-of-tcp/) (High Performance Browser Networking): the handshake, lost packets and why they cost time.
- [Building blocks of UDP](https://hpbn.co/building-blocks-of-udp/) (High Performance Browser Networking): what you give up and gain without a connection.
