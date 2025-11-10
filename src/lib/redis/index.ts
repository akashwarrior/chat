import { createClient } from "redis";

const redisUrl = process.env.CHAT_REDIS_URL;

export function getRedisClient() {
  const client = createClient({
    url: redisUrl,
  });
  return client;
}