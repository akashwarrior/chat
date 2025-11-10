'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Settings2 } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import SearchModal from "./search-modal";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

export default function Header() {
    const { open: isSidebarOpen } = useSidebar();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setIsSearchModalOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);


    return (
        <div className="fixed w-full z-50">
            <div className={cn(
                "h-0 bg-sidebar w-full transition-[height] duration-150 hidden md:flex",
                isSidebarOpen && "h-3"
            )} />

            <div className="absolute left-1.5 top-1.5 p-1 flex items-center rounded-md w-fit overflow-hidden z-50 backdrop-blur-sm bg-sidebar/60 transition-all duration-100">
                <SidebarTrigger />
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "transition-all duration-300 translate-x-0 opacity-100 size-9",
                        isSidebarOpen && "-translate-x-10 opacity-0 size-0"
                    )}
                    onClick={() => setIsSearchModalOpen(true)}
                >
                    <Search />
                </Button>
            </div>

            <div className={cn(
                "absolute top-0 right-0 z-10 h-13 w-28 transition-all duration-150 overflow-hidden text-sidebar -translate-y-full hidden md:block",
                isSidebarOpen && "translate-y-0"
            )}>
                <svg className="skew-x-30 h-full" viewBox="0 0 128 32" fill="currentColor">
                    <path d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0" />
                </svg>
            </div>


            <div className={cn(
                "absolute right-1.5 top-1.5 p-1 flex items-center rounded-md z-20 backdrop-blur-sm bg-sidebar/60",
                isSidebarOpen && "md:rounded-full"
            )}>
                <Button
                    size="icon"
                    variant="ghost"
                    className="hidden sm:flex"
                >
                    <Settings2 />
                </Button>
                <ThemeToggle />
            </div>

            <SearchModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} />
        </div >
    )
}