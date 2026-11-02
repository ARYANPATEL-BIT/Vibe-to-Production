import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Server client for server components, server actions and route handlers.
// Create a new one for every request; never share it between requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components can't write cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}

// Returns the signed-in user's id, or null. getClaims() verifies the token;
// never trust getSession() on the server, its contents can be forged.
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}
