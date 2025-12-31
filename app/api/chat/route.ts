import { google } from "@ai-sdk/google";
import { DEFAULT_MODEL, getModelConfig } from "@/ai/config";
import {
  deleteChatById,
  deleteMessagesByChatIdAfterTimestamp,
  getChatById,
  getMessageById,
  saveChat,
  saveMessages,
  updateChatTitleById,
} from "@/lib/db/queries";
import { getUserRequestContext, jsonErrorResponse } from "@/lib/http";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { setKey } from "@/lib/redis";
import { StreamContext } from "@/lib/stream-context";
import { chatIdSchema, postChatRequestSchema } from "@/lib/validation/chat";
import {
  convertToModelMessages,
  generateId,
  generateText,
  smoothStream,
  streamText,
  type UIMessage,
} from "ai";
import { ZodError } from "zod";

const toAttachments = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === "file")
    .map((part) => ({
      name: part.filename ?? "",
      url: part.url,
      mediaType: part.mediaType,
    }));

const saveMessage = (message: UIMessage, chatId: string) =>
  saveMessages({
    messages: [
      {
        ...message,
        chatId,
        attachments: toAttachments(message),
        createdAt: new Date(),
      },
    ],
  });

export async function POST(request: Request) {
  try {
    const userContext = getUserRequestContext(request.headers);

    if (!userContext) {
      return jsonErrorResponse(401, "Unauthorized");
    }

    const { userId, isAnonymous } = userContext;
    const parsedBody = postChatRequestSchema.parse(await request.json());
    const messages = parsedBody.messages as UIMessage[];
    const {
      id,
      modelId = DEFAULT_MODEL,
      trigger,
    } = parsedBody;

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
          message: `You've reached your daily limit of ${rateLimitResult.limit} messages. ${isAnonymous ? `Sign in to get ${RATE_LIMITS.AUTHENTICATED_DAILY} messages per day. ` : ""}Limit resets at ${resetTime}.`,
        },
        { status: 429 },
      );
    }

    const chat = await getChatById({ id });
    const modelMessages = await convertToModelMessages(messages);
    const lastMessage = messages.at(-1);

    if (!lastMessage || lastMessage.role !== "user") {
      return jsonErrorResponse(
        400,
        "Invalid request",
        "The latest message must be a user message.",
      );
    }

    const persistenceTasks: Promise<unknown>[] = [];

    if (chat) {
      if (chat.userId !== userId) {
        return jsonErrorResponse(403, "Forbidden");
      }

      if (trigger === "regenerate-message") {
        const [message] = await getMessageById({ id: lastMessage.id });

        if (!message) {
          return jsonErrorResponse(
            404,
            "Message not found",
            "The message to regenerate no longer exists.",
          );
        }

        persistenceTasks.push(
          deleteMessagesByChatIdAfterTimestamp({
            chatId: id,
            timestamp: message.createdAt,
          }).then(() => saveMessage(lastMessage, id)),
        );
      } else {
        persistenceTasks.push(saveMessage(lastMessage, id));
      }
    } else {
      persistenceTasks.push(
        saveChat({ id, userId }).then(() => saveMessage(lastMessage, id)),
      );

      persistenceTasks.push(
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
        await Promise.all(persistenceTasks);
        await saveMessages({
          messages: assistantMessages.map((message) => ({
            ...message,
            chatId: id,
            attachments: toAttachments(message),
            createdAt: new Date(),
          })),
        });
      },
      async consumeSseStream({ stream }) {
        const streamId = generateId();
        await setKey({ key: id, value: streamId, ttl: 60 * 5 });
        const streamContext = await StreamContext.getInstance().getStreamContext();
        await streamContext.createNewResumableStream(streamId, () => stream);
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonErrorResponse(400, "Invalid request", error.issues[0]?.message);
    }

    console.error("Unhandled error in chat API:", error);
    return jsonErrorResponse(
      500,
      "Internal server error",
      "Oops, an error occurred!",
    );
  }
}

export async function DELETE(request: Request) {
  const userContext = getUserRequestContext(request.headers);

  if (!userContext) {
    return jsonErrorResponse(401, "Unauthorized");
  }

  const { searchParams } = new URL(request.url);
  const parsedParams = chatIdSchema.safeParse({
    id: searchParams.get("id"),
  });

  if (!parsedParams.success) {
    return jsonErrorResponse(400, "Bad request");
  }

  const { id } = parsedParams.data;
  const chat = await getChatById({ id });

  if (chat?.userId !== userContext.userId) {
    return jsonErrorResponse(403, "Forbidden");
  }

  await deleteChatById({ id });

  return Response.json(
    { message: "Chat deleted successfully" },
    { status: 200 },
  );
}
