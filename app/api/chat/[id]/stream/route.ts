import { getKey } from "@/lib/redis";
import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { StreamContext } from "@/lib/stream-context";
import { chatIdSchema } from "@/lib/validation/chat";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsedParams = chatIdSchema.safeParse(await params);

  if (!parsedParams.success) {
    return new Response(null, { status: 400 });
  }

  const { id } = parsedParams.data;
  const streamId = await getKey({ key: id });

  if (!streamId) {
    return new Response(null, { status: 204 });
  }

  const streamContext = await StreamContext.getInstance().getStreamContext();

  return new Response(await streamContext.resumeExistingStream(streamId), {
    headers: UI_MESSAGE_STREAM_HEADERS,
  });
}
