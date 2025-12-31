export type UserRequestContext = {
  userId: string;
  isAnonymous: boolean;
};

export function getUserRequestContext(
  headers: Headers,
): UserRequestContext | null {
  const userId = headers.get("x-user-id");

  if (!userId) {
    return null;
  }

  return {
    userId,
    isAnonymous: headers.get("x-is-anonymous") === "true",
  };
}

export function jsonErrorResponse(
  status: number,
  error: string,
  message?: string,
) {
  return Response.json(message ? { error, message } : { error }, { status });
}
