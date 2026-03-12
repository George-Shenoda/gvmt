import connectToDB from "@/lib/mongodb";
import { UserSchema } from "@/schema/UserSchema";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { withRateLimit } from "next-limitr";

export const POST = withRateLimit({
    windowMs: 60 * 1000,
    limit: 5,
})(async (req: Request) => {
    try {
        await connectToDB();

        const body = await req.json();
        const parsed = UserSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(parsed.error, { status: 400 });
        }

        const { password, role } = parsed.data;

        const existingUser = await User.findOne({ role });
        if (!existingUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 },
            );
        }

        const existingUserPassword = await bcrypt.compare(
            password,
            existingUser.password,
        );
        if (!existingUserPassword) {
            return NextResponse.json(
                { message: "Invalid password" },
                { status: 401 },
            );
        }

        const accessToken = jwt.sign(
            { id: existingUser._id, roles: existingUser.role },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "15m" },
        );

        const refreshToken = jwt.sign(
            { id: existingUser._id },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "7d" },
        );

        const response = NextResponse.json({ accessToken });
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60, // 15 minutes
        });

        // 🔁 REFRESH TOKEN → rotation endpoint later
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        console.log("User logged in successfully");
        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
});
