import type { NextRequest } from "next/server";
import { deleteAllChatsByUserId, getChatsByUserId } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = request.headers.get("x-user-id") as string;

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const searchQuery = searchParams.get("searchQuery") || null;

  const chats = await getChatsByUserId({
    userId,
    limit,
    skip,
    searchQuery,
  });

  return Response.json(chats);
}

export async function DELETE(request: NextRequest) {
  const userId = request.headers.get("x-user-id") as string;

  const result = await deleteAllChatsByUserId({ userId });

  return Response.json(result, { status: 200 });
}
