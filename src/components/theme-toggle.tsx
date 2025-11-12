'use client';

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            size="icon"
            variant="ghost"
            className="relative"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <Sun className="absolute opacity-0 transition-all duration-200 dark:opacity-100 rotate-0 dark:-rotate-180 scale-0 dark:scale-100" />
            <Moon className="absolute opacity-100 transition-all duration-200 rotate-0 dark:-rotate-180 dark:opacity-0 dark:scale-0 scale-100" />
        </Button>
    )
}