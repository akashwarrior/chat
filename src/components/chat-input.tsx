'use client'

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Attachment } from "@/lib/types";
import { PreviewAttachment } from "./messages/preview-attachment";
import { DEFAULT_MODEL, getAvailableModels } from "@/ai/config";
import { useChatInputStore } from "@/store/chat-input-store";
import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import {
    ArrowUpIcon,
    ChevronDownIcon,
    CpuIcon,
    PaperclipIcon,
    StopCircleIcon
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"

interface ChatInputProps {
    isLoading: boolean;
    stop: () => void;
    sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
}

const models = getAvailableModels();

export function ChatInput({ isLoading, stop, sendMessage }: ChatInputProps) {
    const { input, setInput } = useChatInputStore();
    const [uploadQueue, setUploadQueue] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const submitForm = async () => {
        if (isLoading) return;

        const result = sendMessage({
            role: "user",
            parts: [
                ...attachments.map((attachment) => ({ type: "file" as const, ...attachment })),
                {
                    type: "text",
                    text: input,
                },
            ],
        }, {
            body: {
                modelId: selectedModelId,
            },
        });
        setAttachments([]);
        setInput("");
        await result;
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Enter") {
            if (e.nativeEvent.isComposing || e.shiftKey) {
                return;
            }
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) {
                form.requestSubmit();
            }
        }
    };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadQueue(files.map((file) => file.name));
        const successfullyUploadedAttachments: Attachment[] = [];
        for (const file of files) {
            const uploadedAttachment: Attachment = {
                mediaType: file.type,
                name: file.name,
                url: "",
            };

            const fileReader = new FileReader();
            fileReader.onload = () => {
                uploadedAttachment.url = fileReader.result as string;
                successfullyUploadedAttachments.push(uploadedAttachment);
            };
            fileReader.readAsDataURL(file);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setAttachments((currentAttachments) => [
            ...currentAttachments,
            ...successfullyUploadedAttachments,
        ]);
        setUploadQueue([]);
    };

    useEffect(() => {
        textareaRef.current?.focus();
    }, [input]);

    return (
        <form action={submitForm} className="max-w-3xl w-full rounded-xl border mx-auto space-y-2 py-2 bg-accent/90 mb-1">
            {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div className="flex flex-row items-end gap-2 overflow-x-auto">
                    {attachments.map((attachment) => (
                        <PreviewAttachment
                            attachment={attachment}
                            key={attachment.url}
                            onRemove={() => {
                                setAttachments((currentAttachments) =>
                                    currentAttachments.filter((a) => a.url !== attachment.url)
                                );
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                        />
                    ))}

                    {uploadQueue.map((filename) => (
                        <PreviewAttachment
                            attachment={{
                                url: "",
                                name: filename,
                                mediaType: "",
                            }}
                            isUploading={true}
                            key={filename}
                        />
                    ))}
                </div>
            )}

            <Textarea
                ref={textareaRef}
                autoFocus
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'Type your message here...'}
                className={cn(
                    "w-full resize-none rounded-none border-none shadow-none outline-none ring-0!",
                    "field-sizing-content min-h-20 max-h-58 bg-transparent!",
                )}
            />

            <div className="flex items-center justify-between px-2">
                <input
                    className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    tabIndex={-1}
                    type="file"
                />

                <div className="flex items-center justify-center gap-1">
                    <Button
                        size='icon-sm'
                        variant="ghost"
                        type="button"
                        className="bg-background/50 hover:bg-input!"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <PaperclipIcon className="size-4" />
                    </Button>

                    <Select defaultValue={selectedModelId} onValueChange={setSelectedModelId}>
                        <SelectTrigger
                            asChild
                            className="border-none shadow-none bg-background/50! hover:bg-input! duration-200"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8!"
                            >
                                <CpuIcon />
                                <span className="hidden font-medium text-xs sm:block">
                                    {models.find((model) => model.id === selectedModelId)?.name}
                                </span>
                                <ChevronDownIcon />
                            </Button>
                        </SelectTrigger>
                        <SelectContent className="min-w-[260px] p-0" >
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    <div>
                                        <div className="truncate font-medium text-xs">{model.name}</div>
                                        <div className="mt-px truncate text-[10px] text-muted-foreground leading-tight">
                                            {model.description}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>


                <Button
                    size='icon'
                    type="button"
                    className="gap-1.5 rounded-lg"
                    onClick={() => isLoading ? stop() : submitForm()}
                >
                    {isLoading ? <StopCircleIcon className="size-4" /> : <ArrowUpIcon />}
                </Button>
            </div>
        </form>
    )
}