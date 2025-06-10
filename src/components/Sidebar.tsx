"use client";

import Link from "next/link";
import { LogIn, Pin, PinOff, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function SideBar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useSidebarStore();
    const { data: session } = useSession();

    if (pathname === "/auth") {
        return null;
    }

    return (
        <>
            {isOpen && (
                <div className="absolute left-0 top-0 w-full h-full max-h-screen bg-black/50 z-10 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside className={cn(
                "absolute top-0 left-0 md:relative z-10 w-0 flex flex-col items-center p-0 bg-sidebar gap-4 h-full transition-all duration-150 overflow-hidden",
                isOpen && "w-72 md:w-64 p-3.5 md:pt-1 pb-5"
            )}>
                {isOpen && <>
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
                            <ThreadButton title="Greeting" href="/" pinned={true} selected={pathname === "/"} />
                            <ThreadButton title="New Thread" href="/" pinned={false} selected={false} />
                            <ThreadButton title="Greeting" href="/" pinned={false} selected={false} />
                        </div>
                    </div>

                    {session?.user ? (
                        <Link href="/settings/account" className="w-full">
                            <Button
                                variant="ghost"
                                className="w-full justify-start items-center gap-3 py-7"
                            >
                                <Image
                                    src={session.user.image!}
                                    alt="User"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                                <div className="text-left">
                                    <p className="text-sm font-medium">{session.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                                </div>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/auth" className="w-full">
                            <Button
                                variant="ghost"
                                className="w-full justify-start items-center gap-5 py-6 !px-5"
                            >
                                <LogIn /> Login
                            </Button>
                        </Link>
                    )}
                </>}
            </aside>
        </>
    )
}


function ThreadButton({ title, href, pinned, selected }: { title: string, href: string, pinned: boolean, selected: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "w-full flex items-center justify-between group overflow-hidden",
                buttonVariants({ variant: "ghost", className: selected && "bg-accent" })
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