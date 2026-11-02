## What changed and why

<!-- Plain language. One feature or fix per PR. -->

## Security-relevant changes

- [ ] None
- [ ] New/changed endpoint or server action (auth → authorize → rate limit → validate checked)
- [ ] New/changed table or policy (RLS on, per-action policies, `with check` on updates)
- [ ] New env var (added to `.env.example` and set in the host dashboard)
- [ ] New dependency (real, popular, maintained, necessary)
- [ ] New third-party service receiving user data (privacy policy updated)
- [ ] Touches payments, credits or entitlements (webhook-only, idempotent)

## Checked

- [ ] CI and Security checks are green
- [ ] Reviewed with `prompts/03-review.md` in a fresh session; critical/high findings fixed
- [ ] Tested on the preview deployment, including on a phone-sized screen
- [ ] Two-account test, if this touches user data
- [ ] No existing tests were changed to make them pass
