'use client'

import { useRef } from "react"
import type { UIMessage } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Response } from "@/components/ai-elements/response"
import { PreviewAttachment } from "@/components/messages/preview-attachment"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"

type MessagePartProps = {
  editing: boolean;
  handleEditableBlur: () => void;
  handleEditableChange: (value: string) => void;
  handleEditableKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  message: UIMessage;
};

export function MessagePart({
  editing,
  handleEditableBlur,
  handleEditableChange,
  handleEditableKeyDown,
  isLoading,
  message,
}: MessagePartProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!message.parts?.length) {
    return null;
  }

  return message.parts.map((part, index) => {
    const isStreaming = isLoading && index === message.parts.length - 1;
    const key = `${message.id}-part-${index}`;

    switch (part.type) {
      case "file":
        return (
          <PreviewAttachment
            key={key}
            attachment={{
              name: part.filename ?? "",
              ...part,
            }}
          />
        );

      case "reasoning":
        return (
          <Reasoning
            key={key}
            className="w-full"
            isStreaming={isStreaming}
          >
            <ReasoningTrigger />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        );

      case "text":
        return (
          <div
            key={key}
            className={cn(
              "w-fit overflow-hidden rounded-2xl px-3 py-2 text-sm wrap-break-word",
              message.role === "user" && "ml-auto",
              !editing &&
              message.role === "user" &&
              "bg-primary text-primary-foreground"
            )}
          >
            {editing ? (
              <>
                <Textarea
                  autoFocus
                  className="field-sizing-content mb-2 ml-auto h-fit max-w-full resize-none rounded-2xl px-3 py-2 text-sm"
                  defaultValue={part.text}
                  onKeyDown={handleEditableKeyDown}
                  ref={textareaRef}
                  rows={1}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    className="h-fit px-3 py-2"
                    onClick={handleEditableBlur}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-fit px-3 py-2"
                    data-testid="message-editor-send-button"
                    disabled={isLoading}
                    onClick={() =>
                      handleEditableChange(textareaRef.current?.value ?? "")
                    }
                    type="button"
                  >
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </>
            ) : (
              <Response isAnimating={isStreaming}>{part.text}</Response>
            )}
          </div>
        );

      default:
        return null;
    }
  });
}