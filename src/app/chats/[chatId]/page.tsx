'use client'

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextAreaPrompt } from "@/store/textAreaPrompt";
import { openDatabase } from "@/lib/persistence/db";
import { useChatHistory } from "@/lib/persistence/useChatHistory";
import { toast } from "sonner";

const db = await openDatabase();

export default function ChatPage() {
    const router = useRouter();
    const { chatId } = useParams<{ chatId: string }>();
    const { ready, initialMessages, storeMessageHistory, setInitialMessages } = useChatHistory({ db, chatId });
    const { prompt, setPrompt } = useTextAreaPrompt();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, append, status, reload, stop, setMessages } = useChat({
        initialMessages,
        onError: (error) => toast.error(error.message),
        onFinish: (message) => storeMessageHistory(message),
    });

    useEffect(() => {
        if (prompt) {
            append({ role: "user", content: prompt });
            storeMessageHistory({
                id: crypto.randomUUID(),
                role: 'user',
                content: prompt,
            });
            setPrompt("");
        }
    }, [prompt])


    useEffect(() => {
        const timeout = setTimeout(() => {
            if (messagesEndRef.current && messagesEndRef.current.getBoundingClientRect().top <= window.innerHeight) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 20);

        return () => {
            clearTimeout(timeout);
        }
    }, [messages])


    useEffect(() => {
        if (!ready) return;
        if (!messages.length && !initialMessages.length) {
            router.push("/");
        }
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 10);

        return () => {
            clearTimeout(timeout);
        }
    }, [ready])


    return (
        <div
            className="flex-1 flex flex-col gap-2 px-4 py-14 max-w-3xl overflow-scroll [&::-webkit-scrollbar]:hidden w-full">
            <h1>Chat {chatId}</h1>
            <div className="flex flex-col gap-6">
                {messages.map(({ id, role, content }) => (
                    <div
                        key={id}
                        className={cn(
                            "rounded-xl px-4 py-3 shadow-sm whitespace-pre-wrap",
                            role === "user" && "bg-card border border-border/50 self-end",
                        )}
                    >
                        <p className="whitespace-pre-wrap">
                            {content.trim()}
                        </p>
                        {role === "assistant" && (
                            <div className="flex items-center justify-start">
                                {/* Button to refresh the message */}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                        const newMessages = messages.slice(0, messages.findIndex((m) => m.id === id));
                                        setMessages(newMessages);
                                        reload();
                                        setInitialMessages(newMessages);
                                    }}
                                    className="rounded-full active:rotate-180 transition-transform duration-200 mt-1"
                                >
                                    <RefreshCcwIcon />
                                </Button>

                                {/* Button to copy the message */}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                        navigator.clipboard.writeText(content);
                                    }}
                                    className="rounded-full active:scale-95 transition-transform duration-200 mt-1"
                                >
                                    <CopyIcon />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
                {(status === "submitted") && (
                    <span className="animate-pulse bg-card px-4 py-3 rounded-xl border border-border/50 shadow-sm w-fit text-muted-foreground text-sm">
                        AI is thinking...
                    </span>
                )}

            </div>
            <div ref={messagesEndRef} />
        </div>
    )
}