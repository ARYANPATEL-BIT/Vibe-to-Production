import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

// Runs before every matched request: refreshes the auth session and
// sends signed-out visitors away from protected pages.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          // Stops CDNs from caching a response that carries someone's session cookie.
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not put any code between createServerClient and getClaims.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const path = request.nextUrl.pathname;
  if (!signedIn && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
