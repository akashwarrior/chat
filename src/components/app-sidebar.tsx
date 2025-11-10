'use client'

import Link from "next/link"
import Image from "next/image"
import { mutate } from "swr"
import { toast } from "sonner"
import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { User } from "better-auth"
import { usePathname, useRouter } from "next/navigation"
import { unstable_serialize } from "swr/infinite"
import { getChatHistoryPaginationKey, SidebarHistory } from "./sidebar-history"
import { LogInIcon, SearchIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogClose
} from "./ui/dialog"

export function AppSidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDeleteId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const chatId = deleteId;
    const currentId = pathname.split("/").pop();

    const deletePromise = fetch(`/api/chat?id=${chatId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
      finally: () => setDeleteId(null),
    });

    if (currentId === chatId) {
      router.back();
    }
  };


  return (
    <Sidebar>
      <SidebarHeader className="p-3.5 gap-4 flex flex-col items-center">
        <Link href="/" className="text-xl font-bold">
          Chat
        </Link>
        <Button
          onClick={() => router.push("/")}
          className="w-full"
        >
          New Chat
        </Button>

        <div className="flex items-center rounded-md w-full border-b border-slate-700 px-2 focus-within:bg-secondary focus-within:text-secondary-foreground focus-within:border-ring transition-all duration-150">
          <SearchIcon size={14} />
          <Input
            placeholder="Search your threads..."
            className="flex-1 border-none bg-transparent! focus-visible:ring-0"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3.5 flex-1">
        {user ? (
          <SidebarHistory
            showDialog={setDeleteId}
          />
        ) : (
          <div className="px-2 text-sm text-zinc-500">
            Login to save and revisit previous chats!
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <Link href="/settings/account" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start items-center gap-3 py-7"
            >
              <Image
                src={user.image || "/images/avatar.png"}
                alt="User"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </Button>
          </Link>
        ) : (
          <Link href="/auth" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start items-center gap-5 py-6 px-5"
            >
              <LogInIcon /> Login
            </Button>
          </Link>
        )}
      </SidebarFooter>

      <Dialog onOpenChange={handleDialogOpenChange} open={!!deleteId}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleDelete}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}