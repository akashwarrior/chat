import { createClient } from "redis";

const redisUrl = process.env.CHAT_REDIS_URL;

if (!redisUrl) {
  throw new Error("CHAT_REDIS_URL is not configured.");
}

type RedisClient = ReturnType<typeof createClient>;

let redisConnection: Promise<RedisClient> | undefined;

function createRedisConnection(): RedisClient {
  const client = createClient({
    url: redisUrl,
  });

  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });

  return client;
}

async function connectRedisClient() {
  const client = createRedisConnection();
  await client.connect();
  return client;
}

export async function getRedisClient() {
  if (!redisConnection) {
    redisConnection = connectRedisClient().catch((error) => {
      redisConnection = undefined;
      throw error;
    });
  }

  return redisConnection;
}

export async function createConnectedRedisClient() {
  const client = createRedisConnection();
  await client.connect();
  return client;
}

export async function setKey({
  key,
  value,
  ttl,
}: {
  key: string;
  value: string;
  ttl: number;
}) {
  const client = await getRedisClient();

  await client.set(key, value, {
    expiration: { type: "EX", value: ttl },
  });
}

export async function getKey({ key }: { key: string }) {
  const client = await getRedisClient();
  return client.get(key);
}

export async function deleteKey({ key }: { key: string }) {
  const client = await getRedisClient();
  await client.del(key);
}
