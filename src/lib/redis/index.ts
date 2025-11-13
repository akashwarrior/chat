import { createClient } from "redis";

const redisUrl = process.env.CHAT_REDIS_URL;

export function getRedisClient() {
  const client = createClient({
    url: redisUrl,
  });
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
  const client = getRedisClient();
  try {
    await client.connect();
    await client.set(key, value, {
      expiration: { type: "EX", value: ttl },
    });
  } finally {
    await client.close();
  }
}

export async function getKey({ key }: { key: string }) {
  const client = getRedisClient();
  try {
    await client.connect();
    return await client.get(key);
  } finally {
    await client.close();
  }
}

export async function deleteKey({ key }: { key: string }) {
  const client = getRedisClient();
  try {
    await client.connect();
    await client.del(key);
  } finally {
    await client.close();
  }
}