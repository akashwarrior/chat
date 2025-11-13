import { getKey } from "@/lib/redis";
import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { StreamContext } from "@/lib/stream-context";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const streamId = await getKey({ key: id });

  if (!streamId) {
    return new Response(null, { status: 204 });
  }

  const streamContext = StreamContext.getInstance().getStreamContext();

  return new Response(await streamContext.resumeExistingStream(streamId), {
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}
