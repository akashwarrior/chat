'use client';

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebarStore";
import { PanelLeft, Search, Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSearchModalStore } from "@/store/searchModalStore";
import ThemeToggle from "@/components/ThemeToggle";

export default function HeaderOptions() {
    const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } = useSidebarStore();
    const setIsSearchModalOpen = useSearchModalStore(state => state.setIsOpen);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === "/auth") {
            return;
        }
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setIsSearchModalOpen(true);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [pathname]);

    if (pathname === "/auth") {
        return null;
    }

    return (
        <div className="relative w-full">
            {/* Top line on header open */}
            <div className={cn(
                "h-0 bg-sidebar w-full transition-[height] duration-150 hidden md:flex",
                isSidebarOpen && "h-3"
            )} />

            {/* Sidebar toggle button */}
            <div className="absolute left-1.5 top-1.5 p-1 flex items-center bg-sidebar rounded-md w-fit overflow-hidden z-50">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <PanelLeft />
                </Button>
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

            {/* Right side of header open */}
            <div className={cn(
                "absolute top-0 right-0 z-10 h-13 w-28 transition-all duration-150 overflow-hidden text-sidebar -translate-y-full hidden md:block",
                isSidebarOpen && "translate-y-0"
            )}>
                <svg className="skew-x-[30deg] h-full" viewBox="0 0 128 32" fill="currentColor">
                    <path d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0" />
                </svg>
            </div>


            {/* Settings and theme toggle */}
            <div className={cn(
                "absolute right-1.5 top-1.5 p-1 flex items-center bg-sidebar rounded-md z-20",
                isSidebarOpen && "md:rounded-full"
            )}>
                <Button variant="ghost" size="icon" tooltip="Settings">
                    <Settings2 />
                </Button>
                <ThemeToggle />
            </div>
        </div>
    )
}