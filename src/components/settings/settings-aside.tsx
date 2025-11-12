'use client'

import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { User } from "better-auth";

export function SettingsAside({ user }: { user: User }) {
  const router = useRouter();

  return (
    <aside className="hidden md:w-80 w-full p-6 md:flex flex-col border-b md:border-b-0 md:border-r">
      <Button
        variant="ghost"
        className="mb-6 w-fit -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon />
        Back to Chat
      </Button>

      <div className="flex flex-col items-center mb-6">
        <Image
          src={user.image || "/images/avatar.png"}
          alt={user.name}
          width={100}
          height={100}
          className="rounded-full"
        />
        <h2 className="text-lg lg:text-xl font-semibold text-center">{user.name}</h2>
        <p className="text-xs lg:text-sm text-muted-foreground mb-3 text-center break-all">{user.email}</p>
        <Badge variant="secondary">Free Plan</Badge>
      </div>

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
                <span className="text-xs text-muted-foreground">Standard</span>
                <span className="text-xs font-medium">0/20</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-0" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              20 messages remaining
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="hidden lg:block">
        <h3 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Search</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Ctrl</kbd>
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">K</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">New Chat</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Ctrl</kbd>
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">N</kbd>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Toggle Sidebar</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Ctrl</kbd>
              <kbd className="px-2 py-0.5 rounded bg-muted text-xs">B</kbd>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}