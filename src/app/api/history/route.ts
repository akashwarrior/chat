import type { NextRequest } from "next/server";
import { getChatsByUserId } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = request.headers.get("x-user-id") as string;

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);

  const chats = await getChatsByUserId({
    userId,
    limit,
    skip,
  });

  return Response.json(chats);
}