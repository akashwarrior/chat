'use client'

import { toast } from "sonner"
import { useState } from "react"
import type { UIMessage } from "@ai-sdk/react"
import { UIDataTypes, UIMessagePart, UITools } from "ai"
import EmptyMessage from "./empty-message"
import { MessageActions } from "./message-actions"
import { MessagePart } from "./message-part"

type MessagesProps = {
    isLoading: boolean;
    isReadonly: boolean;
    messages: UIMessage[];
    regenerate: (messageId: string) => void;
    setMessages: (messages: UIMessage[]) => void;
};

export function Messages({
    isLoading,
    isReadonly,
    messages,
    regenerate,
    setMessages,
}: MessagesProps) {
    const [messageBeingEdited, setMessageBeingEdited] = useState<string | null>(
        null
    );

    if (messages.length === 0) {
        return <EmptyMessage />;
    }

    const handleEditStart = (messageId: string) => {
        if (isReadonly) {
            return;
        }

        setMessageBeingEdited(messageId);
    };

    const handleEditCancel = () => setMessageBeingEdited(null);

    const handleEditSubmit = (updatedText: string) => {
        if (!messageBeingEdited) {
            return;
        }

        setMessages(
            messages.map((message) =>
                message.id === messageBeingEdited
                    ? {
                        ...message,
                        parts: message.parts?.map((part) =>
                            part.type === "text" ? { ...part, text: updatedText } : part
                        ),
                    }
                    : message
            )
        );

        regenerate(messageBeingEdited);
        setMessageBeingEdited(null);
    };

    const handleEditKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key !== "Enter" || event.shiftKey) {
            return;
        }

        event.preventDefault();
        handleEditSubmit(event.currentTarget.value);
    };

    const handleCopy = async (
        parts: UIMessagePart<UIDataTypes, UITools>[] = []
    ) => {
        const textToCopy = parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n")
            .trim();

        if (!textToCopy) {
            toast.error("There's no text to copy!");
            return;
        }

        await navigator.clipboard.writeText(textToCopy);
        toast.success("Copied to clipboard!", { closeButton: false });
    };

    return (
        <div className="flex flex-col gap-2">
            {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isStreaming = isLastMessage && isLoading;
                const isEditing = messageBeingEdited === message.id;
                const isUserMessage = message.role === "user";
                const onRegenerate = !isUserMessage ? () => regenerate(message.id) : undefined;
                const onEdit = isUserMessage && !isReadonly ? () => handleEditStart(message.id) : undefined;

                return (
                    <article
                        key={message.id}
                        className="group/message space-y-2"
                        data-testid="chat-message"
                    >
                        <MessagePart
                            editing={isEditing}
                            handleEditableBlur={handleEditCancel}
                            handleEditableChange={handleEditSubmit}
                            handleEditableKeyDown={handleEditKeyDown}
                            isLoading={isStreaming}
                            message={message}
                        />

                        {!isStreaming && (
                            <MessageActions
                                handleCopy={() => handleCopy(message.parts)}
                                isUser={isUserMessage}
                                regenerate={onRegenerate}
                                setEdit={onEdit}
                                sources={message.parts.filter((part) => part.type === 'source-url')}
                            />
                        )}
                    </article>
                );
            })}
        </div>
    );
}