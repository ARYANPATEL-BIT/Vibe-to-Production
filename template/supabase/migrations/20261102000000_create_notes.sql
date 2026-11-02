-- Every table that holds user data follows this pattern:
-- 1. owner column, 2. index for the common query, 3. RLS on, 4. one policy per action.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- The dashboard asks "this user's notes, newest first". This index answers it fast at any size.
create index notes_user_id_created_at_idx on public.notes (user_id, created_at desc);

-- Without this line, anyone holding the public key can read every row. This is the #1 vibe-coded breach.
alter table public.notes enable row level security;

-- (select auth.uid()) instead of auth.uid() lets Postgres evaluate it once per query, not once per row.
create policy "users read own notes" on public.notes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "users insert own notes" on public.notes
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "users delete own notes" on public.notes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- No update policy: notes can't be edited. No policy = no access.

-- Explicit grants: signed-out visitors (anon) get nothing.
revoke all on public.notes from anon;
grant select, insert, delete on public.notes to authenticated;
