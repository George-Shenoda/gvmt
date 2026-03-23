import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function proxy(request: NextRequest) {
    const PUBLIC_FILE = /\.(.*)$/;
    const { pathname } = request.nextUrl;

    // Skip API routes
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Skip static files
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/icons") ||
        pathname.startsWith("/fonts") ||
        pathname === "/favicon.ico" ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    // Allow access to auth pages without token
    if (
        pathname.startsWith("/signin") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password")
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get("accessToken")?.value;

    // If no token, redirect to signin
    if (!token) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Verify token
    try {
        const { payload } = await jwtVerify(token, secret);
        
        // Check admin access
        if (pathname.startsWith("/admin") && payload.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    } catch {
        // Token invalid, redirect to signin
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|favicon.ico|api).*)",
    ],
};
