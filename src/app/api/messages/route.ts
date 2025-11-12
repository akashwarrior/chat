import { NextRequest } from "next/server";
import { getMessagesByChatId, getChatById } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id") as string;
  const { searchParams } = request.nextUrl;
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== userId && chat.visibility !== "public") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getMessagesByChatId({ id: chatId });

    return Response.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
