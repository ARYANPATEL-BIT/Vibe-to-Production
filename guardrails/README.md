# Guardrails

Rules and prompts depend on the AI (and you) paying attention. Guardrails don't. They check the code automatically and block it when something's wrong, no matter who wrote it.

Everything here is free: GitHub Actions minutes on public repos are free and private repos get a monthly free allowance; every tool used is open source.

## What's included

| File | Runs | Catches |
|---|---|---|
| `lefthook.yml` + `.secretlintrc.json` | On your machine, before each commit and push | Secrets in code, committed `.env` files, lint errors, type errors, failing tests |
| `.github/workflows/ci.yml` | Every push to main and every pull request | Lint, type errors, failing tests, broken builds, known-vulnerable production dependencies |
| `.github/workflows/security.yml` | Every push/PR, plus weekly | Live secrets anywhere in git history (TruffleHog), insecure code patterns (Semgrep) |
| `.github/dependabot.yml` | Weekly | Outdated and vulnerable dependencies and Actions (opens PRs) |
| `.github/pull_request_template.md` | Every PR | Forces a pause to tick off security-relevant changes |
| `.github/workflows/backup.yml` | Nightly (optional) | Encrypted database backup for Supabase free tier, which has no daily backups |

## Install

Your project needs these npm scripts (the [template](../template/package.json) has them):

```json
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"test": "vitest run",
"build": "next build"
```

No tests yet? Use `"test": "vitest run --passWithNoTests"` until you write the first one.

Then, from your project root:

```bash
# 1. Copy the files
cp -r path/to/vibe-to-prod/guardrails/.github .
cp path/to/vibe-to-prod/guardrails/lefthook.yml path/to/vibe-to-prod/guardrails/.secretlintrc.json .

# 2. Install the local hooks
npm install -D lefthook secretlint @secretlint/secretlint-rule-preset-recommend
npx lefthook install

# 3. Don't want the backup workflow? Delete it.
rm .github/workflows/backup.yml
```

4. In `ci.yml`, edit the `env:` block under "Build" so it lists placeholder values for the variables **your** build needs.
5. On GitHub: **Settings → Code security** → turn on Dependabot alerts, Dependabot security updates, and Secret scanning (push protection) if offered for your repo.
6. On GitHub: **Settings → Branches → Add rule** for `main` → require a pull request and require the `CI` and `Security` checks to pass. Now nothing reaches main (and your host's production deploy) without passing.

Not using Node? The idea transfers: keep secret scanning, Semgrep, Dependabot and the PR template as-is, and replace the steps in `ci.yml` with your language's lint, typecheck, test, build and audit commands.

## When a check fails

Don't skip it, don't disable it, don't let the AI "fix" it by weakening the check. Paste the failure into your agent:

```text
This check failed in CI. Explain in plain language what it found and whether it's a real problem.
If it's real, fix the code. Do not change the CI config, skip tests, or add ignore comments to make it pass.
If you think it's a false positive, explain why and stop; I'll decide.

[paste the failing log]
```

Specific cases:

- **Secret found:** assume it's compromised. Rotate the key in the provider's dashboard first, then remove it from the code. Removing it from the code alone does nothing; it's in git history.
- **`npm audit` failure:** usually fixable with `npm update` or by accepting a Dependabot PR. If the vulnerable package is only used at build time and the fix isn't released yet, the audit only fails on high/critical in production dependencies, so it's worth reading the advisory before overriding anything.
- **Semgrep finding you're sure is a false positive:** add `// nosemgrep: <rule-id>` on that line **with a comment saying why**. Never add it without a reason.

## Optional: nightly database backup

Supabase's free plan doesn't include daily backups. `backup.yml` dumps your database every night, encrypts it, and stores it as a workflow artifact for 14 days.

**Only use this in a private repository.** Anyone with read access to the repo can download artifacts. The encryption is a second lock, not a reason to relax the first.

Setup:
1. Supabase dashboard → **Connect** → copy the **Session pooler** connection string (GitHub's runners don't support IPv6, which the direct connection needs). Put your database password in it.
2. Repo → **Settings → Secrets and variables → Actions** → add `SUPABASE_DB_URL` (the string above) and `BACKUP_PASSPHRASE` (a long random passphrase, also saved in your password manager).
3. **Actions → Database backup → Run workflow** once and confirm an artifact appears.

**Restore test (do this once before launch):**

```bash
# download the artifact from the workflow run page, then:
gpg -d backup.tar.gz.gpg > backup.tar.gz && tar -xzf backup.tar.gz

# restore into a SCRATCH Supabase project, never production
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file backup/roles.sql \
  --file backup/schema.sql \
  --command 'SET session_replication_role = replica' \
  --file backup/data.sql \
  --dbname "postgresql://...scratch-project-connection-string..."
```

Open the scratch project's table editor and check your data is there. Uploaded files in Storage are not included; back those up separately if they matter.

## What guardrails can't catch

Automated tools find known patterns. They won't notice that your "delete project" action forgets to check the user owns the project, or that your RLS policy lets users read each other's invoices. That's what the [security audit prompt](../prompts/04-security-audit.md) and the [two-account test](../docs/03-data-access.md#the-two-account-test-do-this-before-every-launch) are for.
