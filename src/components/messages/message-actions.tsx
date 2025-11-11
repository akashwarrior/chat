'use client'

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CopyIcon, PencilIcon, RotateCcwIcon } from "lucide-react";
import { Source, Sources, SourcesContent, SourcesTrigger } from "../ai-elements/sources";

export function MessageActions({
  isUser,
  setEdit,
  handleCopy,
  regenerate,
  sources,
}: {
  isUser: boolean;
  setEdit?: () => void;
  handleCopy: () => Promise<void>
  regenerate?: () => void;
  sources?: { sourceId: string, title?: string, url: string }[];
}) {
  return (
    <div className={cn("flex items-start gap-1",
      isUser ? "-mr-0.5 justify-end" : "-ml-0.5"
    )}>

      {isUser && setEdit && (
        <Button
          size="icon-sm"
          variant="ghost"
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
          onClick={setEdit}
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

      {!isUser && regenerate && (
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={regenerate}
        >
          <RotateCcwIcon />
        </Button>
      )}

      {sources && sources.length > 0 && (
        <Sources className="w-fit m-0! inline-flex flex-col center relative">
          <SourcesTrigger
            className="hover:bg-accent px-3 py-1.5 rounded-full"
            totalSources={sources.length}
          />
          <SourcesContent>
            {sources.map((source) => (
              <Source href={source.url} key={source.sourceId} title={source.title} />
            ))}
          </SourcesContent>
        </Sources>
      )}
    </div>
  );
}