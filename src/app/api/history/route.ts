import type { NextRequest } from "next/server";
import { getChatsByUserId } from "@/lib/db/queries";
import { auth } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response(
      "Unauthorized",
      { status: 401 }
    )
  }

  const chats = await getChatsByUserId({
    userId: session.user.id,
    limit,
    skip,
  });

  return Response.json(chats);
}