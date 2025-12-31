import { deleteKey, getKey, setKey } from "./redis";

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

const getResetAt = () => {
  const resetAt = new Date(Date.now());
  resetAt.setUTCHours(24, 0, 0, 0);
  return resetAt;
}

export async function checkRateLimit(userId: string, isAnonymous: boolean): Promise<RateLimitResult> {
  const limit = isAnonymous ? RATE_LIMITS.ANONYMOUS_DAILY : RATE_LIMITS.AUTHENTICATED_DAILY;

  const resetAt = getResetAt();

  const result: RateLimitResult = {
    success: true,
    limit,
    resetAt,
  }

  try {
    const { usage } = await getUsage(userId, isAnonymous);

    if (usage >= limit) {
      return {
        ...result,
        success: false,
      }
    }

    await setUsage(userId, String(usage + 1));
    return result;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return result;
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

export async function setUsage(userId: string, value: string) {
  const key = `${REDIS_KEY}:${userId}`;
  const resetAt = getResetAt();
  const secondsUntilReset = Math.floor((resetAt.getTime() - Date.now()) / 1000);
  await setKey({ key, value, ttl: secondsUntilReset });
}

export async function handleUserMigration(userId: string, newUserId: string) {
  const { usage: currentUsage } = await getUsage(userId, true);
  const { usage: pastUsage } = await getUsage(newUserId, false);

  await setUsage(newUserId, String(pastUsage + currentUsage));
  await deleteKey({ key: `${REDIS_KEY}:${userId}` });
}