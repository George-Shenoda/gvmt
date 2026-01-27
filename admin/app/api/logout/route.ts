import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "next-limitr";

export const POST = withRateLimit({
    windowMs: 60 * 1000,
    limit: 5,
})(async (request: NextRequest) => {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const accessToken = request.cookies.get("accessToken")?.value;

    const response = NextResponse.json(
        { message: "Logged out successfully" },
        { status: 200 },
    );

    if (!accessToken || !refreshToken) {
        return response;
    }

    response.cookies.set("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        path: "/", // VERY IMPORTANT
    });
    response.cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        path: "/", // VERY IMPORTANT
    });

    return response;
});
