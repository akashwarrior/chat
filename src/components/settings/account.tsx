"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Monitor, MonitorIcon, Trash2 } from "lucide-react";
import type { Session } from "better-auth/types";
import type { UsageResult } from "@/lib/rate-limit";

import {
  listSessions,
  signOut,
  useSession,
  revokeSession,
  deleteUser,
} from "@/lib/auth/auth-client";

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

export function Account({ usage }: { usage: UsageResult }) {
  return (
    <>
      <div className="md:hidden">
        <h2 className="text-xl lg:text-2xl font-semibold mb-6">Usage</h2>
        <div>
          <Card className="my-6 p-4!">
            <CardContent className="p-0!">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Message Usage</h3>
                <span className="text-xs text-muted-foreground">
                  Resets daily
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Standard
                    </span>
                    <span className="text-xs font-medium">{usage.usage}/{usage.limit}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-0" style={{ width: `${(usage.usage / usage.limit) * 100}%` }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {usage.limit - usage.usage} messages remaining
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="md:hidden" />

      <div>
        <h2 className="text-xl lg:text-2xl font-semibold mb-6">
          Security Options
        </h2>
        <div>
          <h3 className="text-base lg:text-lg font-semibold mb-2">Devices</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage and sign out from other devices that are currently logged in
            to your account.
          </p>
          <DeviceDialog>
            <Button variant="outline">
              <Monitor />
              View Devices
            </Button>
          </DeviceDialog>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl lg:text-2xl font-semibold mb-6">Danger Zone</h2>
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <DeleteAccountDialog>
            <Button variant="destructive">
              <Trash2 />
              Delete Account
            </Button>
          </DeleteAccountDialog>
        </div>
      </div>
    </>
  );
}

function DeviceDialog({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const router = useRouter();

  const currentSessionToken = session?.session?.token;

  const handleOpenChange = async (open: boolean) => {
    if (!open || sessions) return;
    try {
      const { data } = await listSessions();
      setSessions(data);
    } catch {
      toast.error("Failed to load devices");
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    const isCurrentSession = currentSessionToken === sessionToken;
    try {
      if (isCurrentSession) {
        await Promise.all([revokeSession({ token: sessionToken }), signOut()]);
        router.refresh();
      } else {
        await revokeSession({ token: sessionToken });
        setSessions(sessions?.filter((s) => s.token !== sessionToken) || null);
      }
      toast.success("Session revoked successfully!");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Active Devices</DialogTitle>
          <DialogDescription>
            Manage devices that are currently logged in to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex flex-col overflow-hidden">
          {sessions ? (
            sessions.map((session) => (
              <div
                key={session.token}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <MonitorIcon className="size-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {session.userAgent || "Unknown Device"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {session.ipAddress} •{" "}
                      {formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                      })}
                      {currentSessionToken === session.token && (
                        <span className="inline-flex items-center gap-1 text-green-500 ml-2">
                          <span className="bg-green-500 size-1.5 rounded-full" />
                          (Current Session)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.token)}
                >
                  Revoke
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No active sessions found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const deletePromise = deleteUser();

    toast.promise(deletePromise, {
      loading: "Deleting account...",
      success: async () => {
        await signOut();
        router.refresh();
        return "Account deleted successfully!";
      },
      error: "Failed to delete account",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be
            undone and will permanently delete all your data including chat
            history, preferences, and attachments.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
