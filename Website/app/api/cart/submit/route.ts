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
    
    const submittedCarts = await Cart.find({ submitted: true, fridayDate }).lean();
    
    const orderedByCloth: Record<string, number> = {};
    
    for (const cart of submittedCarts) {
        for (const item of cart.items) {
            const clothId = item.clothesId.toString();
            orderedByCloth[clothId] = (orderedByCloth[clothId] || 0) + item.quantity;
        }
    }
    
    for (const [clothId, ordered] of Object.entries(orderedByCloth)) {
        await Clothes.findByIdAndUpdate(clothId, { ordered });
    }
    
    const allClothes = await Clothes.find().lean();
    for (const cloth of allClothes) {
        if (!orderedByCloth[cloth._id.toString()]) {
            await Clothes.findByIdAndUpdate(cloth._id, { ordered: 0 });
        }
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
