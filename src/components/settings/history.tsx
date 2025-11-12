"use client";

import { toast } from "sonner";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { formatDistanceToNow } from "date-fns";
import { useChatHistory } from "@/hooks/use-chat-history";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PAGE_SIZE = 2;

export function History() {
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, hasMore, mutate, loadMore } = useChatHistory({
    pageSize: PAGE_SIZE,
  });

  const displayChats = data?.[currentPage - 1] || [];

  const handleExportHistory = async () => {
    const toastId = "export";
    setIsExporting(true);
    try {
      const chatsToExport =
        selectedChats.size > 0
          ? Array.from(selectedChats)
          : displayChats.map((chat) => chat.id);

      if (chatsToExport.length === 0) {
        toast.error("No chats to export", { id: toastId });
        return;
      }

      toast.loading(
        `Exporting ${chatsToExport.length} chats with messages...`,
        { id: toastId },
      );

      const chatsWithMessages = await Promise.all(
        chatsToExport.map(async (chatId) => {
          const chat = displayChats.find((c) => c.id === chatId);
          const response = await fetch(`/api/messages?chatId=${chatId}`);
          const messages = response.ok ? await response.json() : [];

          return {
            ...chat,
            messages,
          };
        }),
      );

      const exportData = {
        exportedAt: new Date().toISOString(),
        totalChats: chatsWithMessages.length,
        chats: chatsWithMessages,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${chatsWithMessages.length} chats with all messages!`,
        { id: toastId },
      );
      setSelectedChats(new Set());
    } catch {
      toast.error("Failed to export history", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleChatSelection = (chatId: string) => {
    const newSelection = new Set(selectedChats);
    if (newSelection.has(chatId)) {
      newSelection.delete(chatId);
    } else {
      newSelection.add(chatId);
    }
    setSelectedChats(newSelection);
  };

  const toggleAllChats = () => {
    if (selectedChats.size === displayChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(displayChats.map((c) => c.id)));
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between mb-4 gap-4">
          <h2 className="text-xl lg:text-2xl font-semibold">Chat History</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHistory}
              disabled={isExporting || displayChats.length === 0}
            >
              {isExporting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UploadIcon />
              )}
              <span className="hidden sm:inline">
                {selectedChats.size > 0
                  ? `Export ${selectedChats.size}`
                  : displayChats.length > 0
                    ? "Export All"
                    : "Export"}
              </span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You can back up your chat history from here to restore or transfer
          your conversations later.
        </p>

        <div className="border rounded-lg overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedChats.size === displayChats?.length}
                    onCheckedChange={toggleAllChats}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2Icon className="size-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : displayChats.length > 0 ? (
                displayChats.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedChats.has(chat.id)}
                        onCheckedChange={() => toggleChatSelection(chat.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium truncate">
                      {chat.title}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No chat history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage(currentPage - 1);
              setSelectedChats(new Set());
            }}
          >
            <ChevronLeftIcon />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasMore}
            onClick={() => {
              if (data?.length !== currentPage + 1) {
                loadMore();
              }
              setCurrentPage(currentPage + 1);
              setSelectedChats(new Set());
            }}
          >
            Next
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your history from both your local device and our
          servers.
        </p>
        <DeleteHistoryDialog mutate={mutate}>
          <Button variant="destructive">
            <Trash2Icon />
            Delete Chat History
          </Button>
        </DeleteHistoryDialog>
        <p className="text-xs text-muted-foreground mt-2">
          Note: The retention policies of our LLM hosting partners may vary.
        </p>
      </div>
    </>
  );
}

function DeleteHistoryDialog({
  children,
  mutate,
}: {
  children: React.ReactNode;
  mutate: () => void;
}) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const handleDeleteHistory = () => {
    const deletePromise = fetch("/api/history", {
      method: "DELETE",
    });
    toast.promise(deletePromise, {
      loading: "Deleting all chats...",
      success: () => {
        mutate();
        return "All chats deleted successfully";
      },
      error: "Failed to delete all chats",
    });
    dialogCloseRef.current?.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat History</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all your chat history? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button ref={dialogCloseRef} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDeleteHistory}>
            Delete History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
