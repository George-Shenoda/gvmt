import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import User from "@/models/User";
import connectToDB from "@/lib/mongodb";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Types } from "mongoose";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

type CartItem = {
    clothesId: Types.ObjectId;
    quantity: number;
};

type PopulatedCartItem = CartItem & {
    clothesId: Types.ObjectId & { _id: Types.ObjectId; name?: string };
};

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

export async function GET() {
    try {
        await connectToDB();
        const token = (await cookies()).get("accessToken")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { payload } = await jwtVerify(token, secret);
        const userId = payload.id as string;

        const fridayDate = getNextFridayDate();

        let cart = await Cart.findOne({ userId, fridayDate })
            .populate("items.clothesId")
            .lean();

        if (!cart) {
            cart = await Cart.create({
                userId,
                fridayDate,
                items: [],
                submitted: false,
            });
        }

        const user = await User.findById(userId).lean();

        return NextResponse.json({
            cart: {
                ...cart,
                _id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map((item: PopulatedCartItem) => ({
                    clothesId:
                        item.clothesId?._id?.toString() ||
                        item.clothesId.toString(),
                    name: item.clothesId?.name || "",
                    quantity: item.quantity,
                })),
            },
            userRole: user?.role,
            fridayDate,
        });
    } catch (error) {
        console.error("Cart GET error:", error);
        return NextResponse.json(
            { error: "Failed to get cart" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const token = (await cookies()).get("accessToken")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { payload } = await jwtVerify(token, secret);
        const userId = payload.id as string;

        const body = await request.json();
        const { items, operation } = body;
        if (!Array.isArray(items)) {
            return NextResponse.json(
                { error: "Invalid items format" },
                { status: 400 },
            );
        }

        const fridayDate = getNextFridayDate();

        let cart = await Cart.findOne({ userId, fridayDate });

        if (!cart) {
            cart = await Cart.create({
                userId,
                fridayDate,
                items: [],
                submitted: false,
            });
        }

        for (const item of items) {
            const existingItem = cart.items.find(
                (i: CartItem) => i.clothesId.toString() === item.clothesId,
            );

            if (existingItem) {
                if (item.quantity === 0) {
                    cart.items = cart.items.filter(
                        (i: CartItem) =>
                            i.clothesId.toString() !== item.clothesId,
                    );
                } else {
                    if (operation === "add") {
                        existingItem.quantity += item.quantity;
                    } else existingItem.quantity = item.quantity;
                }
            } else if (item.quantity > 0) {
                cart.items.push({
                    clothesId: new Types.ObjectId(item.clothesId),
                    quantity: item.quantity,
                });
            }
        }

        cart.items = cart.items.filter((item: CartItem) => item.quantity > 0);
        cart.updatedAt = new Date();
        await cart.save();

        await cart.populate("items.clothesId");

        return NextResponse.json({
            cart: {
                ...cart.toObject(),
                _id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map(
                    (
                        item: CartItem & {
                            clothesId: { _id: Types.ObjectId; name?: string };
                        },
                    ) => ({
                        clothesId: item.clothesId._id.toString(),
                        name: item.clothesId.name || "",
                        quantity: item.quantity,
                    }),
                ),
            },
            fridayDate,
        });
    } catch (error) {
        console.error("Cart POST error:", error);
        return NextResponse.json(
            { error: "Failed to update cart" },
            { status: 500 },
        );
    }
}
