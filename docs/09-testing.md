# 09 · Testing

You don't need 100% test coverage. You need tests on the few things that would hurt most if they silently broke, and you need to stop the AI from cheating on them.

## What to test, in priority order

| Priority | What | How | Why |
|---|---|---|---|
| 1 | **Permissions:** user A can't touch user B's data | The [two-account test](03-data-access.md#the-two-account-test-do-this-before-every-launch), plus automated tests once you can | Worst-case bug, invisible in normal use |
| 2 | **Money:** entitlements, plan limits, credit math, webhook handling | Unit tests | Bugs cost money directly |
| 3 | **Critical flows:** sign up → core action → pay | End-to-end tests with [Playwright](https://playwright.dev) (free) | If these break, the business stops |
| 4 | **Input validation:** schemas reject bad input | Unit tests (the template has [examples](../template/src/lib/validation.test.ts)) | Cheap, fast, catches regressions |
| 5 | Everything else | As you go | |

## Every bug becomes a test

When something breaks in production: before fixing it, ask the AI to write a test that reproduces the bug and fails. Then fix it. The test now guards against that bug coming back forever. This is the single best habit for a growing codebase.

## AI tests cheat. Watch for it.

AI agents are rewarded for "tests pass", and they'll take shortcuts to get there:

- **Editing the test** to match broken code instead of fixing the code
- **Mocking everything** so the test checks nothing real
- **Assertions that can't fail**, like `expect(result).toBeDefined()` or `expect(true).toBe(true)`
- **Skipping tests** with `.skip` or `xit` "temporarily"
- **Deleting a failing test** and not mentioning it

Defenses:
- The agent rules in this repo forbid changing existing tests to make them pass without saying so.
- When reviewing a change, look at the test files that changed. If a test was modified in the same change as the code it tests, ask why.
- Occasionally break the code on purpose (change a `<` to `>`) and run the tests. If they still pass, they're not testing anything.

## Writing good tests with AI

Don't ask "write tests for this". Give the cases yourself, in plain language:

> Write tests for the `canEditProject` function. Cases: the owner can edit; a team member with 'editor' role can edit; a member with 'viewer' role cannot; a user from another team cannot; a signed-out user cannot; an owner whose subscription expired can still view but not edit. Don't mock the function under test.

You know the business rules. The AI knows the test syntax. That split works.

## Run tests automatically

Tests that only run when you remember are tests that don't run. The [CI guardrail](../guardrails/README.md) runs lint, typecheck, tests and build on every push and pull request. A red check means don't merge.

## Done when

- [ ] Permission rules are tested (manually with two accounts at minimum)
- [ ] Money and entitlement logic has unit tests
- [ ] Sign up → core action → pay has an end-to-end test
- [ ] Every production bug fixed so far has a test
- [ ] Tests run in CI on every push; a failing check blocks merging
