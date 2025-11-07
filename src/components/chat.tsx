'use client'

import { useEffect } from "react";
import { Messages } from "./messages";
import { ChatInput } from "./chat-input";
import { UIMessage, useChat } from "@ai-sdk/react";
import { useChatInputStore } from "@/store/chat-input-store";
import { DefaultChatTransport } from "ai";
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton
} from "./ai-elements/conversation";

export function Chat({
    id,
    initialMessages,
    isReadonly,
}: {
    id: string;
    initialMessages: UIMessage[],
    isReadonly: boolean;
}) {
    const setInput = useChatInputStore(state => state.setInput);
    const { messages, status, stop, regenerate, sendMessage, setMessages, resumeStream } = useChat({
        messages: initialMessages,
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: {
                chatId: id,
            },
        })
    });

    useEffect(() => {
        const mostRecentMessage = initialMessages.at(-1);

        if (mostRecentMessage?.role === "user") {
            resumeStream();
        }
    }, [])

    console.log(messages);

    return (
        <div className="min-h-full max-h-screen bg-background w-full flex flex-col">
            <Conversation>
                <ConversationContent className="py-14 md:py-10">
                    <Messages
                        isReadonly={isReadonly}
                        messages={messages}
                        regenerate={(messageId) => {
                            stop();
                            regenerate({ messageId });
                        }}
                        setInput={setInput}
                        setMessages={setMessages}
                        isLoading={status === 'streaming' || status === 'submitted'}
                    />
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            {!isReadonly && (
                <ChatInput
                    stop={stop}
                    isLoading={status === 'streaming' || status === 'submitted'}
                    sendMessage={sendMessage}
                />
            )}
        </div>
    )
}