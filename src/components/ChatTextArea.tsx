'use client'

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { useTextAreaPrompt } from "@/store/textAreaPrompt";

export default function ChatTextArea() {
    const { prompt, setPrompt } = useTextAreaPrompt();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pathname = usePathname();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (!prompt.includes(textarea.value)) {
            textarea.value = "";
        }
        const delay = Math.floor(200 / (prompt.length - textarea.value.length));
        intervalRef.current = setInterval(() => {
            if (textarea.value.length < prompt.length) {
                textarea.value += prompt[textarea.value.length];
            } else {
                clearInterval(intervalRef.current!);
            }
        }, delay);

        textarea.focus();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [prompt, textareaRef.current]);


    const handleSubmit = (e: React.FormEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        if (target.value.trim() === "") return;

        setPrompt("");
        if (pathname === '/') {
            router.push(`/chats/1`);
        }
    }

    return (
        <div className="w-full max-h-[300px] min-h-32 md:min-h-28 max-w-[750px] mx-auto p-4 bg-secondary rounded-xl ring-8 ring-foreground/10 dark:ring-foreground/5">
            <Textarea
                autoFocus
                ref={textareaRef}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your message here..."
                className="resize-none mx-auto max-h-full p-0 bg-transparent! border-none! ring-0! [&::-webkit-scrollbar]:hidden"
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        handleSubmit(e);
                    }
                }}
            />
        </div>
    )
}