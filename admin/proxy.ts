import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function proxy(request: NextRequest) {
    const PUBLIC_FILE = /\.(.*)$/;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

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

    const token = request.cookies.get("accessToken")?.value;
    if (pathname.startsWith("/signup") || pathname.startsWith("/signin")) {
        if (token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
        await jwtVerify(token, secret);
    } catch {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

// Optional: exclude static files & API
export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
