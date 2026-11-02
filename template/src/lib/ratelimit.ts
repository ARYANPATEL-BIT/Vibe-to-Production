import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limits live in Redis, not in memory: serverless functions do not share memory,
// so an in-memory counter resets on every cold start and protects nothing.
const configured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const limiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute per key
      prefix: "rl",
    })
  : null;

export async function rateLimit(key: string): Promise<{ ok: boolean }> {
  if (limiter) {
    const { success } = await limiter.limit(key);
    return { ok: success };
  }
  // Fail closed in production: no limiter configured means no requests get through.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Rate limiting is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }
  return { ok: true };
}
