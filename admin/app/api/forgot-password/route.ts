import { NextResponse } from "next/server";
import AdminUser from "@/models/AdminUsers";
import connectToDB from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const { name, password } = body;

        if (!name || !password) {
            return NextResponse.json(
                { message: "Name and password are required" },
                { status: 400 },
            );
        }

        const user = await AdminUser.findOne({ name });
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
        console.error("Admin forgot password error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
