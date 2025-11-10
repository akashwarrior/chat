'use client'

import { mutate } from "swr"
import { useEffect, useMemo, useState } from "react"
import { Messages } from "./messages"
import { ChatInput } from "./chat-input"
import { usePathname } from "next/navigation"
import { DefaultChatTransport } from "ai"
import { getChatHistoryPaginationKey } from "./sidebar-history"
import { unstable_serialize } from "swr/infinite"
import { Chat as AiChat, UIMessage, useChat } from "@ai-sdk/react"
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "./ai-elements/conversation"

type ChatProps = {
    id?: string;
    initialMessages: UIMessage[];
    isReadonly: boolean;
};

export function Chat({ id, initialMessages, isReadonly }: ChatProps) {
    const pathname = usePathname();
    const [chatId, setChatId] = useState<string | undefined>(id);

    const chatClient = useMemo(
        () =>
            new AiChat({
                id: chatId,
                generateId: () => crypto.randomUUID(),
                transport: new DefaultChatTransport({
                    api: "/api/chat",
                    prepareReconnectToStreamRequest: ({ id }) => {
                        return { api: `/api/chat/${id}/stream` }
                    }
                }),
            }),
        [chatId]
    );

    const { messages, status, stop, regenerate, sendMessage, setMessages, resumeStream } = useChat({
        ...chatClient,
        messages: initialMessages,
        onFinish: () => mutate(unstable_serialize(getChatHistoryPaginationKey)),
    });

    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        const mostRecentMessage = initialMessages.at(-1);

        if (mostRecentMessage?.role === "user") {
            resumeStream();
        }
    }, []);

    useEffect(() => {
        if (pathname === "/") {
            setChatId(crypto.randomUUID());
        }
    }, [pathname]);

    const handleSubmit = async (
        chat: Omit<UIMessage, "id">,
        modelId: string
    ) => {
        if (pathname === "/" && chatId) {
            window.history.pushState({}, "", `/chat/${chatId}`);
        }

        await sendMessage(chat, {
            body: { modelId },
        });
    };

    const handleRegenerate = (messageId: string) => {
        stop();
        regenerate({ messageId });
    };

    return (
        <div className="flex w-full max-h-screen min-h-full flex-col bg-background">
            <Conversation>
                <ConversationContent className="overflow-x-hidden py-14 md:py-10 min-h-full">
                    <Messages
                        isReadonly={isReadonly}
                        messages={messages}
                        regenerate={handleRegenerate}
                        setMessages={setMessages}
                        isLoading={isLoading}
                    />
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            {!isReadonly && (
                <ChatInput
                    isLoading={isLoading}
                    stop={stop}
                    submit={handleSubmit}
                />
            )}
        </div>
    );
}