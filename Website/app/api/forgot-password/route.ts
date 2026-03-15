import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDB from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const { role, password } = body;

        if (!role || !password) {
            return NextResponse.json(
                { message: "Role and password are required" },
                { status: 400 },
            );
        }

        const user = await User.findOne({ role });
        if (!user) {
            return NextResponse.json(
                { message: "المستخدم غير موجود" },
                { status: 404 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            message: "تم تغيير كلمة المرور بنجاح",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
