'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar";
import { PanelLeft, Search, Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function HeaderOptions() {
    const pathname = usePathname();
    if (pathname === "/auth") {
        return null;
    }
    const { isOpen, setIsOpen } = useSidebarStore();

    return (
        <>
            {/* Top line on header open */}
            <div className={cn(
                "absolute left-0 top-0 p-1.5 bg-sidebar w-screen transition-all duration-150 -translate-y-full hidden md:block",
                isOpen && "translate-y-0"
            )} />

            {/* Sidebar toggle button */}
            <div className="absolute left-1.5 top-1.5 p-1 flex items-center bg-sidebar rounded-md w-fit overflow-hidden z-50">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <PanelLeft />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "transition-all duration-300 translate-x-0 opacity-100 size-9",
                        isOpen && "-translate-x-10 opacity-0 size-0"
                    )}
                >
                    <Search />
                </Button>
            </div>

            {/* Right side of header open */}
            <div className={cn(
                "absolute top-0 right-0 z-10 h-13 w-30 transition-all duration-150 overflow-hidden text-sidebar -translate-y-full hidden md:block",
                isOpen && "translate-y-0"
            )}>
                <svg className="skew-x-[30deg] h-full" viewBox="0 0 128 32" fill="currentColor">
                    <path d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0" />
                </svg>
            </div>

            {/* Settings and theme toggle */}
            <div className="absolute right-1.5 top-1.5 p-1 flex items-center bg-sidebar rounded-md z-20">
                <Button variant="ghost" size="icon" tooltip="Settings">
                    <Settings2 />
                </Button>
                <ThemeToggle />
            </div>
        </>
    )
}