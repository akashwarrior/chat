import { auth } from "@/lib/auth/auth";
import { google } from "@ai-sdk/google";
import { DEFAULT_MODEL, getModelConfig } from "@/ai/config";
import { after } from "next/server";
import { getRedisClient, setKey } from "@/lib/redis";
import { createResumableStreamContext } from "resumable-stream";
import {
  saveChat,
  getChatById,
  saveMessages,
  getMessageById,
  deleteChatById,
  deleteMessagesByChatIdAfterTimestamp,
} from "@/lib/db/queries";

import {
  streamText,
  generateText,
  smoothStream,
  convertToModelMessages,
  generateId,
} from "ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") as string;
    const { id, messages, modelId = DEFAULT_MODEL, trigger } = body;

    const chat = await getChatById({ id });

    const modelMessages = convertToModelMessages(messages);

    if (chat) {
      if (chat.userId !== userId) {
        return new Response("Forbidden", { status: 403 });
      }
    } else {
      const { text } = await generateText({
        ...getModelConfig(modelId),
        system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
        messages: modelMessages,
      });
      await saveChat({
        id,
        userId,
        title: text,
      });
    }

    const lastMessage = messages[messages.length - 1];
    const messagesToSave = [lastMessage];
    if (trigger === "regenerate-message") {
      const [message] = await getMessageById({ id: lastMessage.id });
      await deleteMessagesByChatIdAfterTimestamp({
        chatId: id,
        timestamp: message.createdAt,
      });
    }
    await saveMessages({
      messages: messagesToSave.map((message) => ({
        ...message,
        chatId: id,
        attachments: [],
        createdAt: new Date(),
      })),
    });

    const result = streamText({
      ...getModelConfig(modelId),
      messages: modelMessages,
      experimental_transform: smoothStream({ chunking: "word" }),
      topP: 0.1,
      tools: {
        google_search: google.tools.googleSearch({}),
        url_context: google.tools.urlContext({}),
        code_execution: google.tools.codeExecution({}),
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      sendSources: true,
      generateMessageId: () => crypto.randomUUID(),
      onFinish: async ({ messages: assistantMessages }) => {
        await saveMessages({
          messages: assistantMessages.map((message) => ({
            ...message,
            chatId: id,
            attachments: [],
            createdAt: new Date(),
          })),
        });
      },
      async consumeSseStream({ stream }) {
        const streamId = generateId();
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
        await streamContext.createNewResumableStream(streamId, () => stream);
        await setKey({ key: id, value: streamId, ttl: 60 * 5 });
      },
    });
  } catch (error) {
    console.error("Unhandled error in chat API:", error);
    return new Response("Oops, an error occurred!", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Bad request", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  await deleteChatById({ id });

  return Response.json(
    { message: "Chat deleted successfully" },
    { status: 200 },
  );
}
