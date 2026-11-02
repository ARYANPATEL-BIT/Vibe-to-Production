import { z } from "zod";

// Fail fast: if a required setting is missing, the app refuses to start
// instead of breaking later in front of a customer.
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  UPSTASH_REDIS_REST_URL: z.url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

export const env = schema.parse(process.env);
