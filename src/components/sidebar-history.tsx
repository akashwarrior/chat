'use client';

import { motion } from "motion/react"
import { usePathname } from "next/navigation"
import type { Chat } from "@/lib/db/schema"
import useSWRInfinite from "swr/infinite"
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns"
import { Button, buttonVariants } from "./ui/button"
import { TrashIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type ChatGroupLabel =
    | "Today"
    | "Yesterday"
    | "Last 7 Days"
    | "Last 30 Days"
    | "Older than last month";

type GroupedChats = Record<ChatGroupLabel, Chat[]>;

const PAGE_SIZE = 20;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
        (groups, chat) => {
            const chatDate = new Date(chat.createdAt);

            if (isToday(chatDate)) {
                groups["Today"].push(chat);
            } else if (isYesterday(chatDate)) {
                groups["Yesterday"].push(chat);
            } else if (chatDate > oneWeekAgo) {
                groups["Last 7 Days"].push(chat);
            } else if (chatDate > oneMonthAgo) {
                groups["Last 30 Days"].push(chat);
            } else {
                groups["Older than last month"].push(chat);
            }

            return groups;
        },
        {
            "Today": [],
            "Yesterday": [],
            "Last 7 Days": [],
            "Last 30 Days": [],
            "Older than last month": [],
        } as GroupedChats
    );
};

export const getChatHistoryPaginationKey = (index: number) =>
    `/api/history?skip=${index * PAGE_SIZE}&limit=${PAGE_SIZE}`;

interface SidebarHistoryProps {
    showDialog: (id: string) => void;
}

export function SidebarHistory({ showDialog }: SidebarHistoryProps) {
    const pathname = usePathname();
    const selectedChatId = pathname.split("/").pop();

    const { data, error, isValidating, setSize } = useSWRInfinite<Chat[]>(
        getChatHistoryPaginationKey,
        fetcher,
        { revalidateOnMount: true }
    );

    const chats = data?.flat() ?? [];
    const hasChats = chats.length > 0;
    const hasMore = data?.[data.length - 1]?.length === PAGE_SIZE;
    const groupedChats = hasChats ? groupChatsByDate(chats) : null;

    const handleLoadMore = () => {
        if (!hasMore || isValidating) {
            return;
        }

        setSize((prev) => prev + 1);
    };

    if (error) {
        return (
            <div className="px-2 text-sm text-destructive">
                Something went wrong while loading your history.
            </div>
        );
    }

    if (!hasChats && !isValidating) {
        return (
            <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                Your conversations will appear here once you start chatting!
            </div>
        );
    }

    return (
        <>
            {groupedChats &&
                Object.entries(groupedChats)
                    .filter(([, groupChats]) => groupChats.length > 0)
                    .map(([label, groupChats]) => (
                        <ChatGroup
                            key={label}
                            label={label as ChatGroupLabel}
                            chats={groupChats}
                            selectedChatId={selectedChatId ?? undefined}
                            onDelete={showDialog}
                        />
                    ))}

            {isValidating && (
                <HistorySkeleton />
            )}

            {hasMore && !isValidating && (
                <motion.div
                    className="h-4"
                    onViewportEnter={handleLoadMore}
                />
            )}
        </>
    );
}

interface ChatGroupProps {
    label: ChatGroupLabel;
    chats: Chat[];
    selectedChatId?: string;
    onDelete: (id: string) => void;
}

function ChatGroup({ label, chats, selectedChatId, onDelete }: ChatGroupProps) {
    return (
        <section>
            <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                {label}
            </div>
            <div className="flex flex-col gap-1">
                {chats.map((chat) => (
                    <ThreadButton
                        key={chat.id}
                        title={chat.title}
                        href={`/chat/${chat.id}`}
                        selected={chat.id === selectedChatId}
                        onDelete={() => onDelete(chat.id)}
                    />
                ))}
            </div>
        </section>
    );
}

interface ThreadButtonProps {
    title: string;
    href: string;
    selected: boolean;
    onDelete: () => void;
}

function ThreadButton({ title, href, selected, onDelete }: ThreadButtonProps) {
    return (
        <Link
            href={href}
            prefetch={false}
            className={cn(
                "group/thread flex w-full items-center justify-between overflow-hidden",
                buttonVariants({
                    variant: "ghost",
                    className: selected ? "bg-accent" : undefined,
                })
            )}
        >
            <span className="flex-1 truncate text-sm font-normal">{title}</span>
            <div className="-mr-3 flex translate-x-full transition-transform duration-150 group-hover/thread:translate-x-0">
                <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="hover:bg-sidebar-border! hover:shadow-sm"
                    onClick={(event) => {
                        event.preventDefault();
                        onDelete();
                    }}
                >
                    <TrashIcon />
                </Button>
            </div>
        </Link>
    );
}

function HistorySkeleton() {
    return (
        <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((width) => (
                <div
                    className="flex h-8 items-center gap-2 rounded-md px-2"
                    key={width}
                >
                    <div
                        className="flex-1 rounded-md bg-sidebar-accent-foreground/10 h-5"
                        style={{ maxWidth: `${width}%` }}
                    />
                </div>
            ))}
        </div>
    );
}