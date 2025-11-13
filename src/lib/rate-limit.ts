import { getKey, getRedisClient } from "./redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  resetAt: Date;
}

export const RATE_LIMITS = {
  ANONYMOUS_DAILY: 10,
  AUTHENTICATED_DAILY: 50,
} as const;

const REDIS_KEY = "rate_limit";

export async function checkRateLimit(userId: string, isAnonymous: boolean): Promise<RateLimitResult> {
  const client = getRedisClient();
  const limit = isAnonymous ? RATE_LIMITS.ANONYMOUS_DAILY : RATE_LIMITS.AUTHENTICATED_DAILY;

  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0);

  const result: RateLimitResult = {
    success: true,
    limit,
    resetAt,
  }

  try {
    await client.connect();
    const key = `${REDIS_KEY}:${userId}`;

    const currentCount = await client.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= limit) {
      return {
        ...result,
        success: false,
      }
    }

    const millisecondsUntilReset = Math.max(1000, resetAt.getTime() - now.getTime());
    const newCount = count + 1;
    await client.set(key, newCount.toString(), {
      expiration: {
        type: "PX",
        value: millisecondsUntilReset,
      },
    });

    return result;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return result;
  } finally {
    await client.quit();
  }
}

export interface UsageResult {
  usage: number;
  limit: number;
}

export async function getUsage(userId: string, isAnonymous: boolean): Promise<UsageResult> {
  const key = await getKey({ key: `${REDIS_KEY}:${userId}` });
  return {
    usage: key ? parseInt(key, 10) : 0,
    limit: isAnonymous ? RATE_LIMITS.ANONYMOUS_DAILY : RATE_LIMITS.AUTHENTICATED_DAILY,
  };
}