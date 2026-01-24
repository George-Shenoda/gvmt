import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";

export async function GET() {
    try {
        await connectToDB();
        const clothes = await ClothesModel.find().lean();
        if (!clothes || clothes.length === 0) {
            return NextResponse.json(
                { error: "No clothes found" },
                { status: 404 },
            );
        }
        const parsedClothes = clothes.map((cloth) => {
            const normalized = {
                ...cloth,
                _id: cloth._id.toString(), // 🔥 FIX
            };

            const parsed = ClothesSchema.safeParse(normalized);

            if (!parsed.success) {
                throw new Error(parsed.error.message);
            }

            return parsed.data;
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

export async function POST(request: Request) {
    try {
        await connectToDB();
        const body = await request.json();
        const clothParsed = ClothesSchema.safeParse(body);
        if (!clothParsed.success) {
            return NextResponse.json(
                { error: clothParsed.error.message },
                { status: 400 },
            );
        }
        const newCloth = await ClothesModel.create(clothParsed.data);
        return NextResponse.json(newCloth, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to create cloth ${error}` },
            { status: 500 },
        );
    }
}

