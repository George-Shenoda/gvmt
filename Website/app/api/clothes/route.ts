import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import mongoose from "mongoose";
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
        const clothesData = clothes.map((cloth) => {
            const clothParsed = ClothesSchema.safeParse(cloth);
            if (!clothParsed.success) {
                throw new Error(clothParsed.error.message);
            }
            return clothParsed.data;
        });
        return NextResponse.json(clothesData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to fetch clothes ${error}` },
            { status: 500 },
        );
    }
}
