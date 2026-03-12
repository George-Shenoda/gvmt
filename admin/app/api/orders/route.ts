import { NextResponse } from "next/server";
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    clothesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clothes",
    },
    quantity: Number,
});

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    fridayDate: String,
    items: [CartItemSchema],
    submitted: Boolean,
    createdAt: Date,
    updatedAt: Date,
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

const UserSchema = new mongoose.Schema({
    password: String,
    role: String,
});

const User = mongoose.models.users || mongoose.model("users", UserSchema);

export async function GET() {
    try {
        const mongoose = await import("mongoose");
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!mongoose.connection.readyState) {
            await mongoose.connect(MONGODB_URI!);
        }

        const carts = await Cart.find({ submitted: true })
            .populate("userId")
            .populate("items.clothesId")
            .sort({ fridayDate: -1 })
            .lean();

        const ordersByDate: Record<string, any[]> = {};

        for (const cart of carts) {
            const fridayDate = cart.fridayDate || "unknown";
            
            if (!ordersByDate[fridayDate]) {
                ordersByDate[fridayDate] = [];
            }

            const userRole = (cart.userId as any)?.role || "غير معروف";
            
            const itemsWithNames = cart.items.map((item: any) => ({
                name: item.clothesId?.name || "غير معروف",
                quantity: item.quantity,
            }));

            ordersByDate[fridayDate].push({
                _id: cart._id.toString(),
                userRole,
                items: itemsWithNames,
                totalItems: itemsWithNames.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
                submittedAt: cart.updatedAt,
            });
        }

        const result = Object.entries(ordersByDate).map(([date, orders]) => ({
            date,
            orders,
            totalOrders: orders.length,
            totalItems: orders.reduce((sum: number, order) => sum + order.totalItems, 0),
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
