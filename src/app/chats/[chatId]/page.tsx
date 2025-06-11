'use client'

import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { useTextAreaPrompt } from "@/store/textAreaPrompt";
import { useEffect, useRef } from "react";

export default function ChatPage() {
    const { chatId } = useParams();
    const { prompt, setPrompt } = useTextAreaPrompt();
    const { messages, append, status } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (prompt) {
            append({ role: "user", content: prompt });
            setPrompt("");
        }
    }, [prompt])


    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            if (messagesEndRef.current && messagesEndRef.current.getBoundingClientRect().top <= window.innerHeight) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 20);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }
    }, [messages])
    

    useEffect(() => {
        const handleScroll = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }

        messagesContainerRef.current?.addEventListener("scroll", handleScroll);

        return () => {
            messagesContainerRef.current?.removeEventListener("scroll", handleScroll);
        }
    }, []);
    

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 flex flex-col gap-2 px-4 py-14 max-w-3xl overflow-scroll [&::-webkit-scrollbar]:hidden w-full">
            <h1>Chat {chatId}</h1>
            <div className="flex flex-col gap-6">
                {messages.map(({ id, role, parts }) => (
                    <div
                        key={id}
                        className={cn(
                            "rounded-xl px-4 py-3 shadow-sm whitespace-pre-wrap",
                            role === "user" && "bg-card border border-border/50 self-end",
                        )}
                    >
                        {parts.map((part, i) => {
                            switch (part.type) {
                                case 'text':
                                    return <div key={`${id}-${i}`}>{part.text}</div>;
                            }
                        })}
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