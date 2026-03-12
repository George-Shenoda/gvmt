import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

    let token = request.cookies.get("accessToken")?.value;
    const refToken = request.cookies.get("refreshToken")?.value;

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
    
    
    try {
        let jwt = await jwtVerify(token, secret);
        if(pathname.startsWith("/admin") && jwt.payload.role !== "admin"){
            return NextResponse.redirect(new URL("/", request.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    return NextResponse.next();
}

// Optional: exclude static files & API
export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
