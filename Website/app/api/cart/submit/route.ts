import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import Clothes from "@/models/Clothes";
import User from "@/models/User";
import connectToDB from "@/lib/mongodb";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

function getNextFridayDate(): string {
    const now = new Date();
    const cairoNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const day = cairoNow.getDay();
    const friday = 5;
    const daysUntilFriday = (friday - day + 7) % 7;
    const nextFriday = new Date(cairoNow);
    nextFriday.setDate(cairoNow.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    return nextFriday.toISOString().split("T")[0];
}

async function recalculateOrdered() {
    const fridayDate = getNextFridayDate();

    const orderedAggregation = await Cart.aggregate([
        { $match: { submitted: true, fridayDate } },
        { $unwind: "$items" },
        { $group: { _id: "$items.clothesId", ordered: { $sum: "$items.quantity" } } },
    ]);

    const orderedByCloth: Record<string, number> = {};
    for (const item of orderedAggregation) {
        orderedByCloth[item._id.toString()] = item.ordered;
    }

    const { Types } = await import("mongoose");
    const bulkOps = [];
    for (const [clothId, ordered] of Object.entries(orderedByCloth)) {
        bulkOps.push({
            updateOne: {
                filter: { _id: new Types.ObjectId(clothId) },
                update: { $set: { ordered } },
            },
        });
    }
    bulkOps.push({
        updateMany: {
            filter: { _id: { $nin: Object.keys(orderedByCloth).map(id => new Types.ObjectId(id)) } },
            update: { $set: { ordered: 0 } },
        },
    });

    if (bulkOps.length > 0) {
        await Clothes.bulkWrite(bulkOps);
    }
}

export async function POST() {
    try {
        await connectToDB();
        const token = (await cookies()).get("accessToken")?.value;
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, secret);
        const userId = payload.id as string;

        const user = await User.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const fridayDate = new Date();
        const cairoNow = new Date(fridayDate.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
        const day = cairoNow.getDay();
        const friday = 5;
        const daysUntilFriday = (friday - day + 7) % 7;
        const nextFriday = new Date(cairoNow);
        nextFriday.setDate(cairoNow.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
        const fridayDateStr = nextFriday.toISOString().split("T")[0];

        const cart = await Cart.findOne({ userId, fridayDate: fridayDateStr });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        cart.submitted = true;
        cart.updatedAt = new Date();
        await cart.save();

        await recalculateOrdered();

        return NextResponse.json({
            message: "Cart submitted successfully",
            userRole: user.role,
            fridayDate: fridayDateStr,
            itemsCount: cart.items.length,
        });
    } catch (error) {
        console.error("Cart submit error:", error);
        return NextResponse.json({ error: "Failed to submit cart" }, { status: 500 });
    }
}
