import { cn } from "@/lib/utils";
import { Response } from "../ai-elements/response";
import { MessageActions } from "./message-actions";
import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../ai-elements/reasoning";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import EmptyMessage from "./empty-message";
import { PreviewAttachment } from "./preview-attachment";

interface MessagesProps {
    isLoading: boolean;
    messages: UseChatHelpers<UIMessage>['messages'];
    regenerate: (messageId: string) => void;
    setMessages: UseChatHelpers<UIMessage>['setMessages'];
    isReadonly: boolean;
    setInput: (input: string) => void;
};

export function Messages({ messages, isLoading, regenerate, setMessages, isReadonly, setInput }: MessagesProps) {
    const [editableMessageId, setEditableMessageId] = useState<string | null>(null);
    const [editableMessageValue, setEditableMessageValue] = useState<string>("");

    const handleEditableFocus = (messageId: string, value: string) => {
        setEditableMessageId(messageId);
        setEditableMessageValue(value);
    }

    const handleEditableChange = () => {
        if (!editableMessageId) return;
        setMessages((prev) => prev.map((message) => message.id === editableMessageId ? { ...message, parts: message.parts?.map((part) => part.type === 'text' ? { ...part, text: editableMessageValue } : part) } : message));
        setEditableMessageId(null);
        setEditableMessageValue("");
        regenerate(editableMessageId);
    }

    const handleEditableBlur = () => {
        setEditableMessageId(null);
    }

    const handleEditableKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEditableChange();
        }
    }

    return messages.length > 0 ? messages.map((message) => (
        <div
            key={`message-${message.id}`}
            className="group/message z-10!"
        >
            {message.parts?.map((part, index) => {

                if (part.type === 'file') {
                    return (
                        <PreviewAttachment
                            key={`${message.id}-file-part-${index}`}
                            attachment={{
                                name: part.filename || "",
                                ...part,
                            }}
                        />
                    )
                }

                if (part.type === 'reasoning') {
                    return (
                        <Reasoning
                            key={`${message.id}-reasoning-part-${index}`}
                            isStreaming={isLoading && index === message.parts.length - 1}
                            className="w-full"
                        >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                    )
                }

                if (part.type === "text") {
                    return (
                        <div key={`${message.id}-text-part-${index}`}
                            className={cn(
                                "overflow-hidden rounded-2xl px-3 py-2 text-sm w-fit wrap-break-word z-10!",
                                editableMessageId !== message.id && message.role === "user" && "bg-primary text-primary-foreground",
                                message.role === "user" && "ml-auto"
                            )}
                        >
                            {editableMessageId === message.id ? (
                                <>
                                    <Textarea
                                        autoFocus
                                        value={editableMessageValue}
                                        onChange={(e) => setEditableMessageValue(e.target.value)}
                                        onKeyDown={handleEditableKeyDown}
                                        className="rounded-2xl px-3 py-2 text-sm w-fit ml-auto mb-2 h-fit min-h-0 resize-none field-sizing-content"
                                        rows={1}
                                    />
                                    <div className="flex flex-row justify-end gap-2">
                                        <Button
                                            className="h-fit px-3 py-2"
                                            onClick={handleEditableBlur}
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-fit px-3 py-2"
                                            data-testid="message-editor-send-button"
                                            disabled={isLoading}
                                            onClick={handleEditableChange}
                                            variant="default"
                                        >
                                            {isLoading ? "Sending..." : "Send"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Response className="z-10!">
                                    {part.text}
                                </Response>
                            )}
                        </div>
                    )
                }
            })}

            <MessageActions
                key={`action-${message.id}`}
                isLoading={isLoading && message.id === messages.at(-1)?.id}
                message={message}
                setMode={() => handleEditableFocus(message.id, message.parts?.find((part) => part.type === 'text')?.text || "")}
                regenerate={() => regenerate(message.id)}
            />
        </div>
    )) : (
        <EmptyMessage />
    )
}