"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "@ai-sdk/react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { DEFAULT_MODEL, getAvailableModels } from "@/ai/config";
import { useChatInputStore } from "@/store/chat-input-store";
import { Attachment } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { PreviewAttachment } from "./messages/preview-attachment";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ArrowUpIcon, PaperclipIcon, StopCircleIcon } from "lucide-react";
import { signIn, useSession } from "@/lib/auth/auth-client";

type ChatInputProps = {
  isLoading: boolean;
  stop: () => void;
  submit: (message: Omit<UIMessage, "id">, modelId: string) => Promise<void>;
};

type UploadResult = Attachment | null;

const UPLOAD_PREVIEW_DELAY_MS = 2000;
const MODELS = getAvailableModels();

const animatedItemProps = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  transition: {
    duration: 0.2,
    ease: "easeInOut",
    type: "spring",
    bounce: 0,
    stiffness: 100,
  },
} as const;

export function ChatInput({ isLoading, stop, submit }: ChatInputProps) {
  const { data: session, isPending } = useSession();
  const { input, setInput } = useChatInputStore();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<
    typeof DEFAULT_MODEL | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!selectedModelId) {
      setSelectedModelId(DEFAULT_MODEL);
    }
    textareaRef.current?.focus();
  }, [input]);

  const handleAttachmentRemove = (attachmentUrl: string) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.url !== attachmentUrl),
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const buildMessagePayload = (): Omit<UIMessage, "id"> => ({
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

    if (!session?.user && !isPending) {
      await signIn.anonymous();
    }

    if (isLoading) {
      return;
    }

    const trimmedInput = input.trim();
    const hasPayload = trimmedInput.length > 0 || attachments.length > 0;

    if (!hasPayload) {
      return;
    }

    const message = buildMessagePayload();

    setAttachments([]);
    setInput("");

    await submit(message, selectedModelId ?? DEFAULT_MODEL);
  };

  const handleTextareaKeyDown: React.KeyboardEventHandler<
    HTMLTextAreaElement
  > = (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => null);
        toast.error(
          errorResponse?.error ?? "Failed to upload file, please try again.",
        );
        return null;
      }

      const data = await response.json();
      return data as Attachment;
    } catch {
      toast.error("Failed to upload file, please try again.");
      return null;
    }
  };

  const handleAttachmentClick = () => {
    const isAnonymous = session?.user?.isAnonymous;
    if (isAnonymous && !isPending) {
      toast.error("Sign in to upload attachments", {
        action: {
          label: "Sign in",
          onClick: () => signIn.social({ provider: "google" }),
        },
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (files.length === 0) {
      return;
    }

    setUploadQueue(files.map((file) => file.name));

    try {
      const uploads = await Promise.all(files.map(uploadFile));
      const uploadedAttachments = uploads.filter(
        (attachment): attachment is Attachment => Boolean(attachment),
      );

      if (uploadedAttachments.length > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, UPLOAD_PREVIEW_DELAY_MS),
        );
        setAttachments((current) => [...current, ...uploadedAttachments]);
      }
    } finally {
      setUploadQueue([]);
    }
  };

  const currentModel = MODELS.find((model) => model.id === selectedModelId);
  const showAttachments = attachments.length > 0 || uploadQueue.length > 0;

  return (
    <form
      className="mx-auto w-full max-w-3xl space-y-2 rounded-xl border bg-accent/90 py-2"
      onSubmit={handleFormSubmit}
    >
      {showAttachments && (
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
          <motion.div {...animatedItemProps}>
            <Button
              onClick={handleAttachmentClick}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <PaperclipIcon className="size-4" />
            </Button>
          </motion.div>

          {currentModel && (
            <motion.div {...animatedItemProps}>
              <Select
                defaultValue={currentModel.id}
                onValueChange={(value) =>
                  setSelectedModelId(value as (typeof MODELS)[number]["id"])
                }
              >
                <SelectTrigger className="h-8!">
                  <img
                    alt={`${currentModel.provider} logo`}
                    className="size-3"
                    height={12}
                    src={`/providers/${currentModel.provider.toLowerCase()}.png`}
                    width={12}
                  />
                  <span className="hidden text-xs font-medium sm:block">
                    {currentModel.name}
                  </span>
                </SelectTrigger>
                <SelectContent className="min-w-[260px] p-0">
                  {MODELS.map((model) => (
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
            </motion.div>
          )}
        </div>

        <motion.div {...animatedItemProps}>
          <Button
            className="gap-1.5 rounded-lg"
            onClick={isLoading ? stop : undefined}
            size="icon"
            type={isLoading ? "button" : "submit"}
          >
            {isLoading ? (
              <StopCircleIcon className="size-4" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
