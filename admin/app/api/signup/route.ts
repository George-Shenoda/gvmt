// app/api/auth/register/route.ts
import connectToDB from "@/lib/mongodb";
import { AdminUserSchema as UserSchema } from "@/schema/AdminUsersSchemas";
import { NextResponse } from "next/server";
import User from "@/models/AdminUsers";
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

        const { password, name } = parsed.data;

        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            password: hashedPassword,
            name,
        });
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
});
