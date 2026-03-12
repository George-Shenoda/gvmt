import { NextResponse } from "next/server";
import Clothes from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";

async function resetOrdered() {
    await connectToDB();

    const result = await Clothes.updateMany(
        {},
        { $set: { ordered: 0 } }
    );

    return result.modifiedCount;
}

export async function POST() {
    try {
        const count = await resetOrdered();
        return NextResponse.json({
            message: "Ordered count reset successfully",
            resetCount: count,
        });
    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset ordered count" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const now = new Date();
        const cairoNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
        const day = cairoNow.getDay();
        
        if (day !== 6) {
            return NextResponse.json(
                { message: "Reset only runs on Saturdays (Cairo timezone)", day, cairoTime: cairoNow.toISOString() },
                { status: 200 }
            );
        }

        const count = await resetOrdered();
        return NextResponse.json({
            message: "Ordered count reset successfully",
            resetCount: count,
            day,
        });
    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset ordered count" },
            { status: 500 }
        );
    }
}
