# 07 · Payments

Money bugs are the most expensive bugs: you either give away your product, charge someone twice, or lose a chargeback dispute. The rules are few and strict.

## Pick a provider that does the hard parts

| Option | Good for | Note |
|---|---|---|
| **Merchant of Record** (Lemon Squeezy, Paddle, Polar) | Solo founders selling software globally | They are legally the seller: they collect and pay sales tax/VAT/GST worldwide and handle invoices. Higher fee, far less admin |
| **Stripe** | Most SaaS, maximum flexibility | You handle tax registration yourself (Stripe Tax helps). Availability for new accounts varies by country |
| **Razorpay** | Selling mainly in India (UPI, Indian cards, netbanking) | Strong local payment methods |

Whatever you pick: **use their hosted checkout page** (Stripe Checkout, Razorpay Checkout, Lemon Squeezy checkout). Card numbers then never touch your servers, which keeps you out of most PCI compliance work.

## The five rules

### 1. Never trust prices from the browser

The browser sends "I want the Pro plan". The server decides what Pro costs, using price IDs stored on the server. If your checkout endpoint accepts an `amount` from the client, anyone can buy your product for ₹1.

### 2. The webhook is the source of truth, not the redirect

After paying, the customer is redirected to your "success" page. **Do not grant access on that page.** Users can visit it without paying, close the tab before it loads, or have their payment fail after the redirect.

Grant access only when the provider's **webhook** (a server-to-server message) tells you the payment succeeded.

### 3. Verify every webhook signature

Your webhook URL is public. Anyone can send it a fake "payment succeeded" message. Every provider signs webhooks; verify the signature with your webhook secret before doing anything. Most frameworks need the **raw** request body for this, before any JSON parsing.

### 4. Handle every webhook twice safely

Providers explicitly retry and may deliver the same event more than once. Store each event's ID in a table with a unique constraint and skip ones you've already processed.

```ts
// Illustrative Next.js route handler for Stripe
export async function POST(req: Request) {
  const body = await req.text(); // raw body: required for the signature check
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // processed_events.id is a primary key, so a duplicate insert fails
  const { error } = await admin.from("processed_events").insert({ id: event.id });
  if (error?.code === "23505") return new Response("Already handled", { status: 200 });

  try {
    await handleEvent(event); // update the user's plan in your database
  } catch (err) {
    await admin.from("processed_events").delete().eq("id", event.id); // let the provider retry
    throw err;
  }
  return new Response("ok", { status: 200 });
}
```

`admin` here is a server-only client using your secret key. This is one of the few places that key belongs, because webhooks aren't requests from a user.

### 5. Store entitlements in your database, written only by the server

A `subscriptions` (or `plans`) table that says who has what, until when. Users can read their own row; **only your webhook handler can write it** (no insert/update policy for users). Every paid feature checks this table on the server.

## The subscription lifecycle

"Payment succeeded" is one event of many. Handle at least:

- Checkout completed → grant access
- Renewal succeeded → extend access
- Payment failed → warn the user; most providers retry for a while, then cancel
- Subscription cancelled / expired → remove access at period end
- Refund issued → decide: remove access?
- Dispute/chargeback opened → you'll need evidence: logs of the customer using the product help

Give users a self-serve way to cancel and update their card (Stripe Customer Portal, Lemon Squeezy's portal). Hard-to-cancel subscriptions cause chargebacks, and in several countries they're illegal.

## Testing

- Build and test everything in the provider's **test mode** with their test cards.
- Use the provider's CLI or dashboard to send test webhooks to your local machine (e.g. `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
- Test the unhappy paths: declined card, failed renewal, cancellation, duplicate webhook, webhook with a bad signature.
- Before launch, do one real purchase with your own card in live mode, then refund it.

## Done when

- [ ] Hosted checkout; no card data touches your servers
- [ ] Prices and plans are decided server-side from fixed IDs
- [ ] Access is granted only by verified webhooks, never by the success page
- [ ] Webhook handler is idempotent (event IDs stored with a unique constraint)
- [ ] Entitlements table is writable only by the server
- [ ] Failed payment, cancellation, refund and dispute paths are handled
- [ ] Users can cancel and update payment details themselves
- [ ] Tested in test mode, including unhappy paths; one real live purchase + refund done
