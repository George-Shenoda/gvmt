import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import mongoose from "mongoose";
import User from "../../../models/User";

const CartItemSchema = new mongoose.Schema({
    clothesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clothes",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
});

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fridayDate: {
        type: String,
        required: true,
    },
    items: [CartItemSchema],
    submitted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

export const ClothesSchema = new mongoose.Schema({
    name: String,
    image: {
        data: Buffer,
        contentType: String,
    },
    max: Number,
    available: Number,
    ordered: Number,
});

const Clothes =
    mongoose.models.Clothes || mongoose.model("Clothes", ClothesSchema);

function getNextFridayDate(): string {
    const now = new Date();
    const cairoNow = new Date(
        now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
    );
    const day = cairoNow.getDay();
    const friday = 5;
    const daysUntilFriday = (friday - day + 7) % 7;
    const nextFriday = new Date(cairoNow);
    nextFriday.setDate(
        cairoNow.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday),
    );
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

    const bulkOps = [];
    for (const [clothId, ordered] of Object.entries(orderedByCloth)) {
        bulkOps.push({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(clothId) },
                update: { $set: { ordered } },
            },
        });
    }
    bulkOps.push({
        updateMany: {
            filter: { _id: { $nin: Object.keys(orderedByCloth).map(id => new mongoose.Types.ObjectId(id)) } },
            update: { $set: { ordered: 0 } },
        },
    });

    if (bulkOps.length > 0) {
        await Clothes.bulkWrite(bulkOps);
    }
}

export async function GET(request: Request) {
    try {
        await connectToDB();

        await recalculateOrdered();

        const { searchParams } = new URL(request.url);
        const allCarts = searchParams.get("all") === "true";

        const query = allCarts ? {} : { submitted: true };

        const carts = await Cart.find(query)
            .populate({ path: "userId", model: User, select: "role" })
            .populate({ path: "items.clothesId", model: Clothes, select: "name" })
            .sort({ fridayDate: -1 })
            .lean();

        const ordersByDate: Record<string, unknown[]> = {};

        for (const cart of carts) {
            const fridayDate = cart.fridayDate || "unknown";

            if (!ordersByDate[fridayDate]) {
                ordersByDate[fridayDate] = [];
            }

            const userRole =
                (cart.userId as unknown as { role: string })?.role ||
                "غير معروف";

            const itemsWithNames = (
                cart.items as unknown as {
                    _id?: mongoose.Types.ObjectId;
                    clothesId?: { _id: mongoose.Types.ObjectId; name?: string };
                    quantity: number;
                }[]
            ).map((item) => ({
                _id: item._id?.toString(),
                clothesId: item.clothesId?._id.toString(),
                name: item.clothesId?.name || "غير معروف",
                quantity: item.quantity,
            }));

            ordersByDate[fridayDate].push({
                _id: cart._id.toString(),
                userRole,
                userId: (cart.userId as mongoose.Types.ObjectId)?.toString(),
                fridayDate: cart.fridayDate,
                items: itemsWithNames,
                totalItems: itemsWithNames.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                ),
                submittedAt: cart.updatedAt,
                submitted: cart.submitted,
            });
        }

        const result = Object.entries(ordersByDate).map(([date, orders]) => ({
            date,
            orders,
            totalOrders: orders.length,
            totalItems: orders.reduce(
                (sum: number, order) =>
                    sum + (order as { totalItems: number }).totalItems,
                0,
            ),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 },
        );
    }
}

export async function PATCH(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const { cartId, items, action } = body;

        if (!cartId) {
            return NextResponse.json(
                { error: "Cart ID is required" },
                { status: 400 },
            );
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return NextResponse.json(
                { error: "Cart not found" },
                { status: 404 },
            );
        }

        if (action === "updateItems" && items) {
            cart.items = items.map(
                (item: { clothesId: string; quantity: number }) => ({
                    clothesId: new mongoose.Types.ObjectId(item.clothesId),
                    quantity: item.quantity,
                }),
            );
            cart.updatedAt = new Date();
            await cart.save();
            await recalculateOrdered();
        } else if (action === "submit") {
            cart.submitted = true;
            cart.updatedAt = new Date();
            await cart.save();
            await recalculateOrdered();
        } else if (action === "unsubmit") {
            cart.submitted = false;
            cart.updatedAt = new Date();
            await cart.save();
            await recalculateOrdered();
        }

        return NextResponse.json({ message: "Cart updated successfully" });
    } catch (error) {
        console.error("Orders PATCH error:", error);
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 },
        );
    }
}
