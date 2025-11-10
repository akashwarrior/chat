import { db } from "@/lib/db";
import type { Chat, DBMessage } from "@/lib/db/schema";
import type { VisibilityType } from "@/lib/types";
import { chat, message } from "@/lib/db/schema";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";

export async function saveChat(newChat: Omit<Chat, "createdAt" | "visibility">) {
  try {
    return await db.insert(chat).values({
      ...newChat,
      visibility: "private" as VisibilityType,
      createdAt: new Date(),
    });
  } catch {
    throw new Error("Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(message).where(eq(message.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch {
    throw new Error("Failed to delete chat by id");
  }
}

export async function getChatsByUserId({ limit, skip, userId }: { limit: number; skip: number; userId: string }) {
  try {
    const chats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt))
      .limit(limit)
      .offset(skip);

    return chats;
  } catch {
    throw new Error("Failed to get chats by user id");
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch {
    throw new Error("Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch {
    throw new Error("Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch {
    throw new Error("Failed to get messages by chat id");
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch {
    throw new Error("Failed to get message by id");
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch {
    throw new Error("Failed to delete messages by chat id after timestamp");
  }
}

export async function updateChatVisibilityById({ chatId, visibility }: { chatId: string; visibility: VisibilityType }) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch {
    throw new Error("Failed to update chat visibility by id");
  }
}