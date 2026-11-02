# 08 · Legal and privacy

> This is a practical checklist, not legal advice. Laws differ by country and change. Once you have paying customers or handle sensitive data, pay a lawyer for an hour to review your policies.

Legal work feels optional until a payment provider freezes your account for missing terms, an app store rejects you for no privacy policy, or a customer asks you to delete their data and you can't.

## What you need before taking real users

### 1. Privacy policy

Required almost everywhere you collect personal data (an email address counts), and by app stores, payment providers and Google sign-in.

It must be **true**. A generated template that claims things you don't do is worse than useless. It needs to say:
- What personal data you collect, and why
- Every third party that receives it (your "processors": hosting, database, email, analytics, error tracking, payments, AI providers)
- How long you keep it
- How users can see, export, correct and delete their data
- How to contact you

Tip: ask your AI to list every third-party service your code sends data to. That list is the core of your privacy policy.

### 2. Terms of service

Covers what users may and may not do, payment and refund terms, your liability limits, how you can suspend accounts, and how disputes are handled. Payment providers usually require visible terms and a refund policy.

### 3. Cookie and tracking consent

- Strictly necessary cookies (login sessions) don't need consent in most regimes.
- Analytics, advertising and tracking cookies often do, especially for EU/UK visitors.
- Easiest path: use cookieless analytics and no ad trackers, and you may not need a banner at all. If you do need one, "Reject" must be as easy as "Accept".

### 4. User data rights

Build these early; retrofitting is painful:
- **Delete my account:** removes or anonymizes their personal data, including uploaded files (the template's `on delete cascade` handles database rows tied to a user).
- **Export my data:** a downloadable file of their data.
- **Unsubscribe** from marketing emails in one click. Transactional emails (receipts, password resets) can still be sent.

### 5. Collect less

The safest personal data is the data you never collected. For every field in your signup form, ask: do we need this to deliver the product? Date of birth, phone number, address, gender: only if you truly use them. Less data means smaller breach impact, simpler policies, fewer obligations.

## Laws you'll hear about

| Law | Applies when | Key points |
|---|---|---|
| **GDPR / UK GDPR** | You have users in the EU/UK | Lawful basis for processing, consent for non-essential tracking, data rights, breach notification, agreements with processors |
| **India DPDP Act** | You process personal data of people in India | Notice and consent, purpose limitation, data rights, breach reporting |
| **CCPA / CPRA** | Users in California, above certain business size thresholds | Right to know, delete, and opt out of data "sale/sharing" |
| **CAN-SPAM and similar** | You send marketing email | Accurate sender, physical address, working unsubscribe |
| **COPPA and similar** | Your service is aimed at children (under 13 in the US) | Parental consent. If you're not built for kids, say so in your terms and don't market to them |
| **Accessibility laws** (e.g. ADA, European Accessibility Act) | Depends on country, sector and company size | Aim for WCAG 2.2 AA anyway; it's also better UX (see [10 Customer-ready](10-customer-ready.md)) |

## Sensitive data needs extra care

Health data, financial data, government IDs, biometrics, precise location, children's data, and private messages carry stricter rules and much worse breach consequences. If your product handles any of these, get proper legal advice before launch and consider whether you can avoid storing it at all.

## Business basics

- Decide how you'll handle sales tax/VAT/GST. A Merchant of Record payment provider handles this for you ([07 Payments](07-payments.md)).
- Check the open-source licenses of your dependencies. MIT, Apache-2.0 and BSD are easy. GPL/AGPL can impose obligations on your own code; ask before shipping those in a commercial product.
- Check your hosting plan allows commercial use. Some free tiers (for example Vercel's Hobby plan) are restricted to non-commercial, personal use.

## Done when

- [ ] Privacy policy that accurately lists your data and every processor
- [ ] Terms of service and refund policy, linked in the footer and at checkout
- [ ] Consent banner if you use non-essential cookies/trackers (or cookieless analytics instead)
- [ ] Users can delete their account and export their data
- [ ] Marketing emails have one-click unsubscribe
- [ ] Signup only asks for data you actually use
- [ ] Tax handling decided; dependency licenses checked; hosting plan allows commercial use
