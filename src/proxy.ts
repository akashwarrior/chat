import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth/auth"

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
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