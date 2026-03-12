import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "@/models/AdminUsers";
import connectToDB from "@/lib/mongodb";

const secret = new TextEncoder().encode(
    process.env.ACCESS_TOKEN_SECRET
);

interface RefreshTokenPayload extends JwtPayload {
    id: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        let decoded: RefreshTokenPayload;
        
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET!
            ) as RefreshTokenPayload;
        } catch {
            return null;
        }

        await connectToDB();
        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return null;
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                name: user.name,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "15m" }
        );

        return accessToken;
    } catch {
        return null;
    }
}

export async function GET() {
    const accessToken = (await cookies()).get("accessToken")?.value;
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
        return NextResponse.json({ authorized: false });
    }

    if (accessToken) {
        try {
            const { payload } = await jwtVerify(accessToken, secret);
            const {role} = payload;

            return NextResponse.json({
                authorized: true,
                role,
            });
        } catch {
            // Access token expired, try refresh
        }
    }

    // Try to refresh the token
    if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        
        if (newAccessToken) {
            const response = NextResponse.json({ authorized: true });
            response.cookies.set("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 15 * 60,
            });
            return response;
        }
    }

    return NextResponse.json({ authorized: false, role: "" });
}
