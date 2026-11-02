import { createBrowserClient } from "@supabase/ssr";

// Browser client. Safe to use in client components because Row Level Security
// decides what each user can read and write, not this key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
