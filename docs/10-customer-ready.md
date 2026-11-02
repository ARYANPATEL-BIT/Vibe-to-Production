# 10 · Customer-ready

Secure and scalable gets you a product that doesn't fail. Customer-ready gets you a product people trust enough to pay for. Most of this is small, and AI is great at it once you ask.

## 1. Every screen has four states

AI builds the "happy path" with perfect data. Real users see the other three far more often than you'd think.

| State | Example | Missing it looks like |
|---|---|---|
| **Loading** | Skeleton or spinner while data loads | Blank screen, user clicks again |
| **Empty** | "No projects yet. Create your first one →" | Empty page that looks broken |
| **Error** | "Couldn't load your projects. Try again" + retry | White screen or raw error text |
| **Success** | The data, plus confirmation after actions ("Saved") | User unsure anything happened |

Ask your AI: *"For every page and form, list which of loading, empty, error and success states exist. Add the missing ones."*

## 2. Works on a phone

Most first visits are on mobile. Test every page at 375px wide (dev tools → device toolbar). No sideways scrolling, buttons big enough to tap, forms usable with the on-screen keyboard.

## 3. Fast

- Run [PageSpeed Insights](https://pagespeed.web.dev) on your main pages. Aim for green on mobile.
- The usual culprits: huge images, too many fonts, heavy third-party scripts (chat widgets, trackers), loading everything up front.

## 4. Accessible

Accessibility is a legal requirement in some places and better UX everywhere.

- Everything works with keyboard only (Tab, Enter, Esc). Focus is visible.
- Every input has a label; every meaningful image has alt text; icon-only buttons have an `aria-label`.
- Text has enough contrast against its background.
- Run the free [axe DevTools](https://www.deque.com/axe/devtools/) browser extension on each page and fix what it flags.

## 5. Emails that arrive

- Send from your own domain, through a real email provider (Resend, Postmark, Amazon SES and others have free or cheap tiers). **Your auth provider's built-in email is usually for testing only** (Supabase's default sender is heavily rate-limited).
- Set up SPF, DKIM and DMARC DNS records for your domain (your email provider walks you through it). Without them, your emails go to spam.
- Customize auth emails (magic link, password reset, confirmation) with your brand name, so they don't look like phishing.

## 6. Trust signals

- Custom domain with HTTPS (no `myapp-git-main-xyz.vercel.app` in front of customers)
- Favicon, page titles, and a social share image (Open Graph) so links look real when shared
- A visible way to contact you: support email in the footer and in emails
- Privacy policy, terms and refund policy linked in the footer
- A custom 404 page that links back home
- Clear pricing: what's included, what happens at the limit, how to cancel

## 7. Account basics

Users expect to be able to: change their email, sign out everywhere, update payment details, cancel, export their data, and delete their account. Missing these generates support tickets and, for deletion and export, can break privacy law.

## 8. Onboarding

The first two minutes decide whether someone comes back. After signup, the user should reach the product's core value with as few steps as possible. An empty dashboard is a dead end: give them a sample, a template or one obvious first action.

## 9. SEO basics (if people find you via search)

Unique `<title>` and meta description per page, a `sitemap.xml`, a `robots.txt` that doesn't block everything, real text content (not just images), and server-rendered public pages.

## Done when

- [ ] Every page and form has loading, empty, error and success states
- [ ] Everything works at 375px wide
- [ ] PageSpeed Insights mostly green on mobile for key pages
- [ ] Keyboard-navigable; axe DevTools shows no serious issues
- [ ] Emails come from your domain with SPF/DKIM/DMARC; auth emails are branded
- [ ] Custom domain, favicon, share image, 404 page, footer with contact and legal links
- [ ] Users can manage email, billing, cancellation, export and deletion themselves
- [ ] New users reach the core value within a couple of minutes
