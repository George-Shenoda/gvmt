import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import Cart from "@/models/Cart";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";
import { Binary } from "mongodb";

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

export async function GET() {
    try {
        await connectToDB();
        
        const fridayDate = getNextFridayDate();
        const submittedCarts = await Cart.find({ submitted: true, fridayDate }).lean();
        
        const orderedByCloth: Record<string, number> = {};
        for (const cart of submittedCarts) {
            for (const item of cart.items) {
                const clothId = item.clothesId.toString();
                orderedByCloth[clothId] = (orderedByCloth[clothId] || 0) + item.quantity;
            }
        }

        const clothes = await ClothesModel.find().lean();
        if (!clothes || clothes.length === 0) {
            return NextResponse.json(
                { error: "No clothes found" },
                { status: 404 },
            );
        }
        const parsedClothes = clothes.map((cloth) => {
            const clothId = cloth._id.toString();
            const ordered = orderedByCloth[clothId] || 0;
            
            const normalized = {
                ...cloth,
                _id: clothId,
                ordered,
                image: cloth.image
                    ? {
                          data:
                              cloth.image.data instanceof Binary
                                  ? Buffer.from(cloth.image.data.buffer)
                                  : cloth.image.data,
                          contentType: cloth.image.contentType,
                      }
                    : undefined,
            };

            const parsed = ClothesSchema.safeParse(normalized);

            if (!parsed.success) {
                throw new Error(parsed.error.message);
            }

            return {
                ...parsed.data,
                ordered,
                image: parsed.data.image
                    ? {
                          data: parsed.data.image.data.toString("base64"),
                          contentType: parsed.data.image.contentType,
                      }
                    : undefined,
            };
        });

        return NextResponse.json(parsedClothes, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to fetch clothes ${error}` },
            { status: 500 },
        );
    }
}