import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function proxy(request: NextRequest) {
    const PUBLIC_FILE = /\.(.*)$/;
    const { pathname } = request.nextUrl;

    // ✅ PUBLIC ROUTES FIRST (NO AUTH)
    const token = request.cookies.get("accessToken")?.value;

    if (pathname.startsWith("/api") || pathname.startsWith("/closed")) {
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
    
    const day = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
    ).getDay();
    const isClosedDay = day === 2 || day === 4 || day === 5; // Wed & Thu & Fri
    
    if (isClosedDay) {
        return NextResponse.redirect(new URL("/closed", request.url));
    }
    
    if (pathname.startsWith("/")) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/signup") || pathname.startsWith("/signin")) {
        if (token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // 🔐 AUTH CHECK

    try {
        await jwtVerify(token, secret);
    } catch {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // 🕒 Cairo timezone logic

    return NextResponse.next();
}

// Optional: exclude static files & API
export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
