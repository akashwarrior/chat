import { db } from "@/lib/db";
import type { Chat, DBMessage } from "@/lib/db/schema";
import type { VisibilityType } from "@/lib/types";
import { chat, message } from "@/lib/db/schema";
import { and, asc, desc, eq, gte, ilike } from "drizzle-orm";

export async function saveChat(newChat: Pick<Chat, "userId" | "id">) {
  try {
    return await db.insert(chat).values({
      ...newChat,
      title: "New Thread",
    });
  } catch {
    throw new Error("Failed to save chat");
  }
}

export async function updateChatTitleById({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, id));
  } catch {
    throw new Error("Failed to update chat title by id");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch {
    throw new Error("Failed to delete chat by id");
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch {
    throw new Error("Failed to delete all chats by user id");
  }
}

export async function getChatsByUserId({
  limit,
  skip,
  userId,
  searchQuery,
}: {
  limit: number;
  skip: number;
  userId: string;
  searchQuery: string | null;
}) {
  try {
    const whereClause = searchQuery ?
      and(eq(chat.userId, userId), ilike(chat.title, `%${searchQuery}%`)) :
      eq(chat.userId, userId);
    const chats = await db
      .select()
      .from(chat)
      .where(whereClause)
      .orderBy(desc(chat.updatedAt))
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
    const now = new Date();

    return Promise.all([
      db
        .update(chat)
        .set({ updatedAt: now })
        .where(eq(chat.id, messages[0].chatId)),
      db
        .insert(message).values(messages)
    ]);

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
    return await db
      .delete(message)
      .where(and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)));
  } catch {
    throw new Error("Failed to delete messages by chat id after timestamp");
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch {
    throw new Error("Failed to update chat visibility by id");
  }
}
