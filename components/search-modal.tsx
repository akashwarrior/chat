"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function SearchModal({ isOpen, setIsOpen }: SearchModalProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const router = useRouter();
  const { data: chats } = useChatHistory({
    enabled: isOpen && Boolean(session?.user),
    searchQuery: debouncedSearchQuery,
    pageSize: 5,
  });

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder="Search your threads..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {session?.user ? "No results found." : "Sign in to search your chats."}
        </CommandEmpty>
        <CommandGroup
          heading={
            <span className="flex items-center gap-1.5 text-sm leading-0">
              <Clock size={12} />
              Recent Chats
            </span>
          }
          className="flex flex-col gap-2 p-2"
        >
          {chats?.flat().map((chat) => (
            <ChatItem
              key={chat.id}
              title={chat.title}
              onClick={() => {
                setIsOpen(false);
                router.push(`/chat/${chat.id}`);
              }}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function ChatItem({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <CommandItem className="cursor-pointer py-2 px-3" onClick={onClick}>
      <span>{title}</span>
    </CommandItem>
  );
}
