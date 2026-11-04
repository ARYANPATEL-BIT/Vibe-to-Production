# Install vibe-to-prod into a project

These instructions are for an AI coding agent. You have cloned this repo into a temporary folder (called "the clone" below) and you're setting it up inside the user's project (called "the project"). The user is probably not a developer, so explain what you're doing in plain language as you go.

Two rules for the whole install:

- Never overwrite the user's files. When something already exists, merge or ask.
- Don't commit or push anything. The user commits themselves.

## Steps

1. **Look at the project first.** Find out:
   - The package manager, from the lockfile: `package-lock.json` (npm), `pnpm-lock.yaml` (pnpm), `yarn.lock` (yarn), `bun.lock` or `bun.lockb` (bun). Not JavaScript? Note the language's own tool instead (for example `uv.lock` or `poetry.lock` for Python, `go.mod` for Go).
   - The language and framework (for example TypeScript + Next.js).
   - Whether it uses Supabase (a `supabase/` folder, a `@supabase/*` package, or `SUPABASE` variable names in `.env.example` or the code).
   - Whether it's a git repo.

   Tell the user what you found before changing anything.

2. **Copy the rules files.** Copy `agent-rules/AGENTS.md` and `agent-rules/CLAUDE.md` from the clone to the project root. If either already exists, merge: keep all of the user's content and add ours as a new section at the end. Never overwrite.

3. **Copy the tool settings.** Copy `agent-rules/.claude/settings.json` to `.claude/settings.json` in the project. If one already exists, merge the `permissions.deny` and `permissions.ask` lists (add our entries, keep theirs, no duplicates) and leave everything else as it is. Copy `agent-rules/.cursor/rules/production.mdc` to `.cursor/rules/production.mdc`. If that file already exists, show the diff and ask before changing it.

4. **Copy the guardrails.** Copy these from the clone's `guardrails/` folder into the project, keeping the same paths:
   - `.github/workflows/` (all workflow files)
   - `.github/dependabot.yml`
   - `.github/pull_request_template.md`
   - `lefthook.yml`
   - `.secretlintrc.json`

   If a file with the same name already exists in the project, show the user the diff and ask before changing it.

5. **Adapt `.github/workflows/ci.yml` to this project.**
   - Use the project's package manager and its commands (install, lint, typecheck, test, build, dependency audit). Do the same for the commands in `lefthook.yml`.
   - If the project isn't JavaScript/TypeScript, replace the Node steps with the language's own lint, typecheck, test, build and dependency audit commands. Also change `package-ecosystem: npm` in `.github/dependabot.yml` to the project's ecosystem.
   - In the Build step's `env:` block, put a placeholder value for every environment variable the build needs. Get the names from the code and from `.env.example`. Never read `.env` files that contain real values (`.env`, `.env.local`, `.env.production` and similar).

6. **Check the project's scripts.** The project needs lint, typecheck, test and build commands (in `package.json` scripts for JavaScript projects). If one is missing, add it only if the tool it needs is already installed. If the tool is missing, don't install it: remove that step from `ci.yml` and `lefthook.yml` and tell the user what was left out and why.

7. **Protect secret files.** Make sure `.gitignore` ignores `.env` and `.env.*` but not `.env.example`:

   ```gitignore
   .env
   .env.*
   !.env.example
   ```

   If `.env.example` is missing, create it with the variable names the project uses and placeholder values only. Never copy real values into it.

8. **Decide on the backup workflow.** Keep `.github/workflows/backup.yml` only if the project uses Supabase. If you keep it, tell the user it must only be used in a **private** repo, and that it needs two GitHub secrets, `SUPABASE_DB_URL` and `BACKUP_PASSPHRASE`, set up as described in [the guardrails README](https://github.com/ARYANPATEL-BIT/Vibe-to-Production/blob/main/guardrails/README.md#optional-nightly-database-backup). If the project doesn't use Supabase, delete it.

9. **Install the git hooks.** If the project is a git repo, install `lefthook`, `secretlint` and `@secretlint/secretlint-rule-preset-recommend` as dev dependencies with the project's package manager (for example `npm install -D`, `pnpm add -D`, `yarn add -D` or `bun add -d`), then run `npx lefthook install`. If the project has no `package.json`, ask the user before adding one just for the hooks. If it's not a git repo, skip this step and tell the user.

10. **Run the checks.** Run lint, typecheck, test and build. Report what fails. Don't fix anything yet; the user decides what to fix.

11. **Clean up.** Delete the temporary clone.

12. **Report back. Don't commit or push.** Finish with a plain-language report:
    - Files added or changed, and what each one does in a sentence.
    - Scripts added.
    - Checks that failed, and anything you left out (and why).
    - GitHub settings the user must turn on themselves:
      - **Settings → Code security:** Dependabot alerts, Dependabot security updates, and Secret scanning with push protection.
      - **Settings → Branches:** a branch protection rule on `main` that requires the `CI` and `Security` checks to pass.

13. **Tell the user the next step.** In a fresh AI session, run the security audit prompt on their project:
    https://raw.githubusercontent.com/ARYANPATEL-BIT/Vibe-to-Production/main/prompts/04-security-audit.md
