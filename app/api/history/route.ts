import { deleteAllChatsByUserId, getChatsByUserId } from "@/lib/db/queries";
import { getUserRequestContext, jsonErrorResponse } from "@/lib/http";
import { historyQuerySchema } from "@/lib/validation/chat";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userContext = getUserRequestContext(request.headers);

    if (!userContext) {
      return jsonErrorResponse(401, "Unauthorized");
    }

    const { limit, skip, searchQuery } = historyQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    const chats = await getChatsByUserId({
      userId: userContext.userId,
      limit,
      skip,
      searchQuery,
    });

    return Response.json(chats);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonErrorResponse(400, "Invalid request", error.issues[0]?.message);
    }

    return jsonErrorResponse(500, "Internal server error");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userContext = getUserRequestContext(request.headers);

    if (!userContext) {
      return jsonErrorResponse(401, "Unauthorized");
    }

    const result = await deleteAllChatsByUserId({ userId: userContext.userId });

    return Response.json(result, { status: 200 });
  } catch {
    return jsonErrorResponse(500, "Internal server error");
  }
}
