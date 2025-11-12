import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/auth";

export async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    if (req.nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth", req.nextUrl));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", session.user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
