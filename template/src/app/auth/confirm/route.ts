import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { log } from "@/lib/log";
import { createClient } from "@/lib/supabase/server";

// The magic link lands here. Always redirect to a fixed path:
// taking the destination from the URL would be an open redirect.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let failed = true;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    failed = Boolean(error);
  }

  if (failed) {
    log.warn("sign-in link rejected");
    redirect("/login?error=link");
  }
  redirect("/dashboard");
}
