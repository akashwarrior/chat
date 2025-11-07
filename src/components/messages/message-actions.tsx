'use client'

import { toast } from "sonner";
import type { UIMessage } from "@ai-sdk/react";
import { CopyIcon, PencilIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "../ui/button";

export function MessageActions({
  message,
  isLoading,
  setMode,
  regenerate,
}: {
  message: UIMessage;
  isLoading: boolean;
  setMode?: () => void;
  regenerate?: () => void;
}) {
  if (isLoading) {
    return null;
  }

  const textFromParts = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error("There's no text to copy!");
      return;
    }

    await navigator.clipboard.writeText(textFromParts);
    toast.success("Copied to clipboard!", {
      closeButton: false
    });
  };

  const isUser = message.role === 'user';


  return (
    <div className={isUser ? "flex items-center gap-1 -mr-0.5 justify-end" : "-ml-0.5"}>
      {isUser && setMode && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
          onClick={setMode}
        >
          <PencilIcon />
        </Button>
      )}

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={handleCopy}
      >
        <CopyIcon />
      </Button>

      {!isUser && setMode && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
          onClick={regenerate}
        >
          <RotateCcwIcon />
        </Button>
      )}
    </div>
  );
}