"use server";

import { headers } from "next/headers";
import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation";

export type LoginState = { error?: string; sent?: boolean };

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const email = parsed.data.email.toLowerCase();

  // Limit by IP (stops bots) and by email (stops someone flooding one inbox).
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const byIp = await rateLimit(`login:ip:${ip}`);
  const byEmail = await rateLimit(`login:email:${email}`);
  if (!byIp.ok || !byEmail.ok) return { error: "Too many attempts. Try again in a minute." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm` },
  });

  if (error) {
    log.error("magic link failed", { reason: error.message });
    return { error: "Couldn't send the link. Please try again." };
  }

  // Same answer whether or not the account exists, so nobody can probe for emails.
  return { sent: true };
}
