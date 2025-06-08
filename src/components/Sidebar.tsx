"use client";

import Link from "next/link";
import { LogIn, Pin, PinOff, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar";

export default function SideBar() {
    const pathname = usePathname();
    if (pathname === "/auth") {
        return null;
    }
    const { isOpen, setIsOpen } = useSidebarStore();

    return (
        <>
            {isOpen && (
                <div className="absolute left-0 top-0 w-full h-screen bg-black/50 z-0 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside className={cn(
                "w-72 md:w-64 flex flex-col items-center p-3.5 bg-sidebar gap-4 h-screen transition-all duration-150 -translate-x-full ",
                isOpen && "translate-x-0"
            )}>
                <Link href="/" className="text-xl font-bold">
                    Chat
                </Link>

                <Link href="/" className="w-full">
                    <Button className="w-full">
                        New Chat
                    </Button>
                </Link>

                <div className="flex items-center rounded-md w-full border-b border-slate-700 px-2 focus-within:bg-secondary focus-within:text-secondary-foreground focus-within:border-ring transition-all duration-150">
                    <Search size={14} />
                    <Input
                        placeholder="Search your threads..."
                        className="flex-1 border-none focus-visible:ring-0 bg-transparent!"
                    />
                </div>

                <div className="flex flex-col gap-2 w-full flex-1">
                    <span className="text-xs font-bold text-primary pt-1 px-2">Today</span>
                    <div className="flex flex-col gap-1">
                        <ThreadButton title="Greeting" href="/" pinned={true} />
                        <ThreadButton title="New Thread" href="/" pinned={false} />
                        <ThreadButton title="Greeting" href="/" pinned={false} />
                    </div>
                </div>

                <Link href="/auth" className="w-full">
                    <Button
                        variant="ghost"
                        className="w-full justify-start items-center gap-5 py-6 !px-5"
                    >
                        <LogIn /> Login
                    </Button>
                </Link>
            </aside>
        </>
    )
}


function ThreadButton({ title, href, pinned }: { title: string, href: string, pinned: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "w-full flex items-center justify-between group overflow-hidden",
                buttonVariants({ variant: "ghost" })
            )}
        >
            <span className="text-sm flex-1 font-normal">{title}</span>
            <div className="-mr-3 flex translate-x-full group-hover:translate-x-0 transition-transform duration-150">
                <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 hover:bg-sidebar-border hover:shadow-sm"
                    tooltip={pinned ? "Unpin" : "Pin"}
                >
                    {pinned ? <PinOff /> : <Pin />}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 hover:bg-sidebar-border hover:shadow-sm"
                    tooltip="Delete"
                >
                    <X />
                </Button>
            </div>
        </Link>
    )
}