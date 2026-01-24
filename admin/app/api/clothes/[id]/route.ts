import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    const { id } = await params;
    try {
        await connectToDB();
        const cloth = await ClothesModel.findById(id).lean();
        if (!cloth) {
            return NextResponse.json(
                { error: "Clothes not found" },
                { status: 404 },
            );
        }
        const clothParsed = { ...cloth, _id: cloth._id.toString() };
        const parsedClothes = ClothesSchema.safeParse(clothParsed);
        if (!parsedClothes.success) {
            return NextResponse.json(
                { error: parsedClothes.error.message },
                { status: 400 },
            );
        }
        return NextResponse.json(parsedClothes.data, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to fetch clothes ${error}` },
            { status: 500 },
        );
    }
}
