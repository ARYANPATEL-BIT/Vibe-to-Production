# 03 · Data access: who can touch what

If you read only one guide, read this one. Broken data access is the most common serious flaw in AI-built apps, and the one with the worst consequences: one user reading or changing everyone else's data.

## Signed in is not the same as allowed

Your app has two separate questions:

1. **Authentication:** who is this? (Handled by your auth provider.)
2. **Authorization:** is *this* person allowed to do *this* to *this specific record*?

AI tools are good at #1 and routinely skip #2. The classic result: `/invoices/1042` shows invoice 1042 to anyone signed in, so a user changes the URL to `/invoices/1041` and reads someone else's invoice. This is called an **IDOR** (insecure direct object reference), and it's everywhere in vibe-coded apps.

## Where the check must live

| Place | Can it be trusted for access control? |
|---|---|
| Hiding buttons or pages in the UI | **No.** Cosmetic only |
| Checks in browser JavaScript | **No.** Can be skipped |
| Proxy/middleware redirects | **Partly.** Good first gate, but not enough on its own |
| Server code (API routes, server actions) | **Yes,** if every single endpoint does it |
| Database rules (Postgres Row Level Security, Firebase Security Rules) | **Yes, best.** Applies to every query no matter which code path made it |

The strongest setup does both: the server checks, and the database enforces the same rules underneath, so a single forgotten check in your code isn't a breach.

## Row Level Security (Postgres / Supabase)

If your frontend talks to Supabase directly (it does, with the publishable key), **RLS is your entire security model.** The key in the browser is public by design; RLS is what stops it from reading every table.

The pattern for every table with user data, from the template's [migration](../template/supabase/migrations/20261102000000_create_notes.sql):

```sql
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "users read own notes" on public.notes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "users insert own notes" on public.notes
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "users delete own notes" on public.notes
  for delete to authenticated using ((select auth.uid()) = user_id);
```

How to read a policy:
- `using (...)` decides which **existing** rows the user can see/affect.
- `with check (...)` decides what **new or changed** rows are allowed to look like.
- No policy for an action means nobody can do that action. That's the safe default.

### The RLS mistakes AI makes

| Mistake | What happens | Fix |
|---|---|---|
| Table created without `enable row level security` | Anyone with the public key reads and writes everything | Every table, every time. The audit prompt checks this |
| `using (true)` "to make it work" | Same as no RLS | Write the real ownership condition |
| UPDATE policy with `using` but no `with check` | User edits their own row and changes `user_id` to someone else's, or edits fields they shouldn't | Always add `with check` to update policies |
| `role` or `is_admin` column on the profile table the user can update | Any user makes themselves admin | Keep roles in a separate table users can't write to, or block those columns with a check |
| Using the **service role / secret key** in code that handles user requests | Bypasses RLS completely | Secret key only for admin scripts and trusted background jobs. Never in the browser, never for normal requests |
| Views and `security definer` functions | They can bypass RLS | Create views `with (security_invoker = true)`; avoid `security definer` unless you understand it |
| Storage buckets left public | Anyone can list and download every upload | Private buckets with storage policies, signed URLs |
| Policies call `auth.uid()` directly on big tables | Slow: re-evaluated per row | Wrap it: `(select auth.uid())`, and index the owner column |

### Without RLS (Firebase, Prisma, other ORMs)

- **Firebase:** your Security Rules are the equivalent of RLS. Never ship `allow read, write: if true;` or rules that only check `request.auth != null`.
- **Your own backend with an ORM:** every query that touches user data must include the owner condition, e.g. `where: { id, userId: session.userId }`. Never look up a record by ID alone and then check ownership afterwards in a separate step you might forget.

## The two-account test (do this before every launch)

You don't need to read code to find most authorization bugs. You need two accounts.

1. Create **Account A** and **Account B** in two different browsers (or one normal window, one private window).
2. With Account A, create one of everything: a post, a file, a project, an invoice, a comment.
3. Copy the URLs and IDs of A's things.
4. In Account B's browser, paste those URLs. **You should see "not found" or "not allowed", never A's data.**
5. In Account B, open dev tools → Network tab, perform an edit or delete on B's own item, right-click the request → "Copy as fetch". Paste it into the Console, change the ID to one of A's items, and run it. **It must fail.**
6. Sign out completely and try A's URLs again. **Nothing should load.**
7. If you have admin features, repeat with a normal account trying to reach admin pages and admin actions.

Write down every check you did. Repeat after any feature that adds a new type of data.

## Done when

- [ ] Every table storing user data has RLS (or equivalent rules) enabled with explicit per-action policies
- [ ] Every update policy has `with check`
- [ ] Nobody can change their own role, plan, credits or ownership fields
- [ ] The secret/service key is used only in trusted server-side jobs, never per user request
- [ ] Storage buckets are private with per-user policies
- [ ] The two-account test passes for every data type, including direct API calls
