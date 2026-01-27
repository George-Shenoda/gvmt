import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(
    process.env.ACCESS_TOKEN_SECRET
);

export async function GET() {
    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
        return NextResponse.json({ authorized: false });
    }

    try {
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({
            authorized: true,
        });
    } catch {
        return NextResponse.json({ authorized: false });
    }
}
