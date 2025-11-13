import { getRedisClient } from "./redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}

export const RATE_LIMITS = {
  ANONYMOUS_DAILY: 10,
  AUTHENTICATED_DAILY: 50,
} as const;

export async function checkRateLimit(
  userId: string,
  isAnonymous: boolean,
): Promise<RateLimitResult> {
  const client = getRedisClient();
  const limit = isAnonymous
    ? RATE_LIMITS.ANONYMOUS_DAILY
    : RATE_LIMITS.AUTHENTICATED_DAILY;

  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);
  const secondsUntilReset = Math.max(
    1,
    Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
  );

  try {
    await client.connect();
    const key = `rate_limit:${userId}`;

    const currentCount = await client.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= limit) {
      return {
        success: false,
        remaining: 0,
        limit,
        resetAt,
      };
    }

    const newCount = count + 1;
    await client.set(key, newCount.toString(), {
      expiration: {
        type: "EX",
        value: secondsUntilReset,
      },
    });

    return {
      success: true,
      remaining: Math.max(0, limit - newCount),
      limit,
      resetAt,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return {
      success: true,
      remaining: limit,
      limit,
      resetAt,
    };
  } finally {
    await client.quit();
  }
}
