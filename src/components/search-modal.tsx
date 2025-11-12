"use client";

import { Clock } from "lucide-react";
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
  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Search your threads..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup
          heading={
            <span className="flex items-center gap-1.5 text-sm leading-0">
              <Clock size={12} />
              Recent Chats
            </span>
          }
          className="flex flex-col gap-2 p-2"
        >
          <ChatItem title="Chat 1" />
          <ChatItem title="Chat 2" />
          <ChatItem title="Chat 3" />
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function ChatItem({ title }: { title: string }) {
  return (
    <CommandItem className="cursor-pointer py-2 px-3">
      <span>{title}</span>
    </CommandItem>
  );
}
