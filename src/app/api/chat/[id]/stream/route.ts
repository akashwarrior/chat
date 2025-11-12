import { getKey, getRedisClient } from "@/lib/redis";
import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const streamId = await getKey({ key: id });

  if (!streamId) {
    return new Response(null, { status: 204 });
  }

  const redisClientPublisher = getRedisClient();
  const redisClientSubscriber = getRedisClient();
  await Promise.all([
    redisClientPublisher.connect(),
    redisClientSubscriber.connect(),
  ]);
  const streamContext = createResumableStreamContext({
    waitUntil: after,
    publisher: redisClientPublisher,
    subscriber: redisClientSubscriber,
  });

  return new Response(
    await streamContext.resumeExistingStream(streamId),
    { headers: UI_MESSAGE_STREAM_HEADERS }
  );
}
