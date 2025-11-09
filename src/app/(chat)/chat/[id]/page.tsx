import { Chat } from "@/components/chat";
import { auth } from "@/lib/auth/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { UIDataTypes, UIMessagePart, UITools } from "ai";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    return notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (chat.visibility === "private" && session?.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  return (
    <Chat
      id={id}
      initialMessages={messagesFromDb.map((message) => ({
        id: message.id,
        role: message.role as "user" | "system" | "assistant",
        parts: message.parts as UIMessagePart<UIDataTypes, UITools>[],
        createdAt: message.createdAt,
      }))}
      isReadonly={false}
    />
  );
}
