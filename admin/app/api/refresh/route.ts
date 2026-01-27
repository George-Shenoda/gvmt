import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "@/models/AdminUsers";
import connectToDB from "@/lib/mongodb";
import { withRateLimit } from "next-limitr";

interface RefreshTokenPayload extends JwtPayload {
    id: string;
}

export const GET = withRateLimit({
    windowMs: 60 * 1000,
    limit: 5,
})(async (request: NextRequest) => {
    try {
        const refreshToken = request.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        let decoded: RefreshTokenPayload;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET!
            ) as RefreshTokenPayload;
        } catch {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        await connectToDB();

        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                name: user.name,
            },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "15m" }
        );

        const response = NextResponse.json({ success: true });

        // ✅ IMPORTANT: set new access token cookie
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60,
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
});
