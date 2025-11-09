import { auth } from "@/lib/auth/auth";
import { google } from "@ai-sdk/google";
import { DEFAULT_MODEL, getModelConfig } from "@/ai/config";
import {
    saveChat,
    getChatById,
    saveMessage,
    getMessageById,
    deleteChatById,
    deleteMessagesByChatIdAfterTimestamp,
} from "@/lib/db/queries";

import {
    streamText,
    generateText,
    smoothStream,
    convertToModelMessages,
    createUIMessageStream,
    createUIMessageStreamResponse,
} from "ai";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const body = await request.json();
        const { id, messages, modelId = DEFAULT_MODEL, trigger } = body;

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const chat = await getChatById({ id });

        const modelMessages = convertToModelMessages(messages);
        const promises: Promise<unknown>[] = [];

        if (chat) {
            if (chat.userId !== session.user.id) {
                return new Response("Forbidden", { status: 403 });
            }
        } else {
            promises.push(generateText({
                ...getModelConfig(modelId),
                system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
                messages: modelMessages,
            }).then(({ text }) => {
                return saveChat({
                    id,
                    userId: session.user.id,
                    title: text,
                });
            }));
        };

        return createUIMessageStreamResponse({
            stream: createUIMessageStream({
                execute: ({ writer }) => {
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
                    })

                    result.consumeStream();
                    writer.merge(
                        result.toUIMessageStream({
                            sendReasoning: true,
                            sendSources: true,
                        })
                    );
                },
                onFinish: async ({ messages: assistantMessages }) => {
                    const lastMessage = messages[messages.length - 1];
                    const messagesToSave = [lastMessage, ...assistantMessages];
                    if (trigger === "regenerate-message") {
                        const [message] = await getMessageById({ id: lastMessage.id });
                        promises.push(deleteMessagesByChatIdAfterTimestamp({
                            chatId: id,
                            timestamp: message.createdAt,
                        }))
                    }
                    await Promise.all(promises);
                    await saveMessage({
                        messages: messagesToSave.map((message) => ({
                            ...message,
                            chatId: id,
                            attachments: [],
                            createdAt: new Date(),
                        })),
                    });
                },
            })
        })
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

    return Response.json({ message: "Chat deleted successfully" }, { status: 200 });
}
