'use client'

import { useEffect, useRef, useState } from "react"
import type { UIMessage } from "@ai-sdk/react"
import { DEFAULT_MODEL, getAvailableModels } from "@/ai/config"
import { useChatInputStore } from "@/store/chat-input-store"
import { Attachment } from "@/lib/types"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { PreviewAttachment } from "./messages/preview-attachment"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpIcon, ChevronDownIcon, CpuIcon, PaperclipIcon, StopCircleIcon } from "lucide-react"
import { toast } from "sonner"

type ChatInputProps = {
    isLoading: boolean;
    stop: () => void;
    submit: (message: Omit<UIMessage, "id">, modelId: string) => Promise<void>;
};

const UPLOAD_PREVIEW_DELAY_MS = 2000;
const models = getAvailableModels();

export function ChatInput({ isLoading, stop, submit }: ChatInputProps) {
    const { input, setInput } = useChatInputStore();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [uploadQueue, setUploadQueue] = useState<string[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, [input]);

    const handleAttachmentRemove = (attachmentUrl: string) => {
        setAttachments((current) =>
            current.filter((attachment) => attachment.url !== attachmentUrl)
        );
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const buildMessage = (): Omit<UIMessage, "id"> => ({
        role: "user",
        parts: [
            ...attachments.map((attachment) => ({
                ...attachment,
                type: "file" as const,
            })),
            {
                type: "text" as const,
                text: input,
            },
        ],
    });

    const handleFormSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        if (isLoading) {
            return;
        }

        const trimmedInput = input.trim();
        const hasPayload = trimmedInput.length > 0 || attachments.length > 0;

        if (!hasPayload) {
            return;
        }

        const message = buildMessage();

        setAttachments([]);
        setInput("");

        await submit(message, selectedModelId);
    };

    const handleTextareaKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
            return;
        }

        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/files/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    ...data,
                } as Attachment;
            }
            const { error } = await response.json();
            toast.error(error);
        } catch (_error) {
            toast.error("Failed to upload file, please try again!");
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (files.length === 0) {
            return;
        }
        setUploadQueue(files.map((file) => file.name));
        try {
            const uploadedAttachments = (await Promise.all(files.map(uploadFile))).filter(attachment => !!attachment);
            if (uploadedAttachments.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, UPLOAD_PREVIEW_DELAY_MS));
                setAttachments((current) => [...current, ...uploadedAttachments]);
            }
        } finally {
            setUploadQueue([]);
        }
    };

    return (
        <form
            className="mx-auto w-full max-w-3xl space-y-2 rounded-xl border bg-accent/90 py-2"
            onSubmit={handleFormSubmit}
        >
            {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div className="flex items-end gap-2 overflow-x-auto">
                    {attachments.map((attachment) => (
                        <PreviewAttachment
                            attachment={attachment}
                            key={attachment.url}
                            onRemove={() => handleAttachmentRemove(attachment.url)}
                        />
                    ))}

                    {uploadQueue.map((filename) => (
                        <PreviewAttachment
                            attachment={{ mediaType: "", name: filename, url: "" }}
                            isUploading
                            key={filename}
                        />
                    ))}
                </div>
            )}

            <Textarea
                autoFocus
                className="field-sizing-content min-h-20 max-h-58 w-full resize-none rounded-none border-none bg-transparent! shadow-none outline-none ring-0!"
                name="message"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Type your message here..."
                ref={textareaRef}
                value={input}
            />

            <div className="flex items-center justify-between px-2">
                <input
                    className="-left-4 -top-4 pointer-events-none fixed size-0.5 opacity-0"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    tabIndex={-1}
                    type="file"
                />

                <div className="flex items-center gap-1">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        size="icon-sm"
                        type="button"
                        variant="outline"
                    >
                        <PaperclipIcon className="size-4" />
                    </Button>

                    <Select
                        defaultValue={selectedModelId}
                        onValueChange={setSelectedModelId}
                    >
                        <SelectTrigger asChild className="bg-background">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8!"
                            >
                                <CpuIcon />
                                <span className="hidden text-xs font-medium sm:block">
                                    {models.find((model) => model.id === selectedModelId)?.name}
                                </span>
                                <ChevronDownIcon />
                            </Button>
                        </SelectTrigger>
                        <SelectContent className="min-w-[260px] p-0">
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    <div>
                                        <div className="text-xs font-medium">{model.name}</div>
                                        <div className="mt-px text-[10px] leading-tight text-muted-foreground">
                                            {model.description}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="gap-1.5 rounded-lg"
                    onClick={isLoading ? stop : undefined}
                    size="icon"
                    type={isLoading ? "button" : "submit"}
                >
                    {isLoading ? <StopCircleIcon className="size-4" /> : <ArrowUpIcon />}
                </Button>
            </div>
        </form>
    );
}