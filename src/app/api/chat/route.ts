import { google } from "@ai-sdk/google";
import { DEFAULT_MODEL, getModelConfig } from "@/ai/config";
import { StreamContext } from "@/lib/stream-context";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { setKey } from "@/lib/redis";

import {
  saveChat,
  getChatById,
  saveMessages,
  getMessageById,
  deleteChatById,
  deleteMessagesByChatIdAfterTimestamp,
  updateChatTitleById,
} from "@/lib/db/queries";

import {
  streamText,
  generateText,
  smoothStream,
  convertToModelMessages,
  generateId,
  type UIMessage,
} from "ai";

const saveMessage = (message: UIMessage, chatId: string) =>
  saveMessages({
    messages: [
      {
        ...message,
        chatId,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") as string;
    const isAnonymous = request.headers.get("x-is-anonymous") === "true";
    const {
      id,
      messages,
      modelId = DEFAULT_MODEL,
      trigger,
    } = await request.json();

    const rateLimitResult = await checkRateLimit(userId, isAnonymous);

    if (!rateLimitResult.success) {
      const resetTime = rateLimitResult.resetAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return Response.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached your daily limit of ${rateLimitResult.limit} messages. ${isAnonymous && `Sign in to get ${RATE_LIMITS.AUTHENTICATED_DAILY} messages per day.`} Limit resets at ${resetTime}.`,
        },
        { status: 429 },
      );
    }

    const chat = await getChatById({ id });

    const modelMessages = convertToModelMessages(messages);
    const lastMessage = messages.at(-1);
    const promises: Promise<unknown>[] = [];

    if (chat) {
      if (chat.userId !== userId) {
        return new Response("Forbidden", { status: 403 });
      }

      if (trigger === "regenerate-message") {
        promises.push(
          getMessageById({ id: lastMessage.id })
            .then(([message]) =>
              deleteMessagesByChatIdAfterTimestamp({
                chatId: id,
                timestamp: message.createdAt,
              }),
            )
            .then(() => saveMessage(lastMessage, id)),
        );
      } else {
        promises.push(saveMessage(lastMessage, id));
      }
    } else {
      promises.push(
        saveChat({ id, userId }).then(() => saveMessage(lastMessage, id)),
      );

      promises.push(
        generateText({
          ...getModelConfig(modelId),
          system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 25 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
          messages: modelMessages,
        }).then(({ text }) => updateChatTitleById({ id, title: text })),
      );
    }

    const result = streamText({
      ...getModelConfig(modelId),
      messages: modelMessages,
      experimental_transform: smoothStream({ chunking: "word" }),
      topP: 0.35,
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
        await Promise.all(promises);
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
        await setKey({ key: id, value: streamId, ttl: 60 * 5 });
        const streamContext = StreamContext.getInstance().getStreamContext();
        await streamContext.createNewResumableStream(streamId, () => stream);
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
  const userId = request.headers.get("x-user-id") as string;
  const chat = await getChatById({ id });

  if (chat?.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  await deleteChatById({ id });

  return Response.json(
    { message: "Chat deleted successfully" },
    { status: 200 },
  );
}
