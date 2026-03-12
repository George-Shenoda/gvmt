import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

export async function proxy(request: NextRequest) {
    const PUBLIC_FILE = /\.(.*)$/;
    const { pathname } = request.nextUrl;
    const day = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
    ).getDay();
    const isClosedDay = day === 3 || day === 4 || day === 5; // Wed & Thu & Fri

    // ✅ PUBLIC ROUTES FIRST (NO AUTH)
    let token = request.cookies.get("accessToken")?.value;
    const refToken = request.cookies.get("refreshToken")?.value;
    if (!isClosedDay && pathname.startsWith("/closed")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

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

    if (isClosedDay) {
        return NextResponse.redirect(new URL("/closed", request.url));
    }

    if (pathname.startsWith("/")) {
        return NextResponse.next();
    }

    if (!token && refToken) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/refresh`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: `refreshToken= ${refToken}`,
                    },
                },
            );
            token = (await response.json()).accessToken;
            (await cookies()).set("accessToken", token!, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 15 * 60,
            });
        } catch (error) {
            console.error(error);
        }
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
