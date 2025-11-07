'use client'

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./ui/button"
import { LogInIcon, PinIcon, PinOffIcon, SearchIcon, XIcon } from "lucide-react"
import { Input } from "./ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const session = {
    user: {
      name: "John Doe",
      email: "john.doe@example.com",
      image: undefined,
    }
  }
  return (
    <Sidebar>
      <SidebarHeader className="p-3.5 gap-4 flex flex-col items-center">
        <Link href="/" className="text-xl font-bold">
          Chat
        </Link>

        <Link href="/" className="w-full">
          <Button className="w-full">
            New Chat
          </Button>
        </Link>

        <div className="flex items-center rounded-md w-full border-b border-slate-700 px-2 focus-within:bg-secondary focus-within:text-secondary-foreground focus-within:border-ring transition-all duration-150">
          <SearchIcon size={14} />
          <Input
            placeholder="Search your threads..."
            className="flex-1 border-none focus-visible:ring-0 bg-transparent!"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3.5">
        <span className="text-xs font-bold text-primary pt-1 px-2">Today</span>
        <div className="flex flex-col gap-1">
          <ThreadButton title="Greeting" href="/" pinned={true} selected={true} />
          <ThreadButton title="New Thread" href="/" pinned={false} selected={false} />
          <ThreadButton title="Greeting" href="/" pinned={false} selected={false} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        {session?.user ? (
          <Link href="/settings/account" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start items-center gap-3 py-7"
            >
              <Image
                src={session.user?.image || "/images/avatar.png"}
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
              className="w-full justify-start items-center gap-5 py-6 px-5!"
            >
              <LogInIcon /> Login
            </Button>
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

function ThreadButton({ title, href, pinned, selected }: { title: string, href: string, pinned: boolean, selected: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center justify-between group/item overflow-hidden",
        buttonVariants({ variant: "ghost", className: selected && "bg-accent" })
      )}
    >
      <span className="text-sm flex-1 font-normal">{title}</span>
      <div className="-mr-3 flex translate-x-full group-hover/item:translate-x-0 transition-transform duration-150">
        <Button
          size="sm"
          variant="ghost"
          className="w-8 h-8 hover:bg-sidebar-border hover:shadow-sm"
        >
          {pinned ? <PinOffIcon /> : <PinIcon />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-8 h-8 hover:bg-sidebar-border hover:shadow-sm"
        >
          <XIcon />
        </Button>
      </div>
    </Link>
  )
}