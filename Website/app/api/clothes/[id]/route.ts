import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";

export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const { id } = await params;
    try {
        await connectToDB();

        if (!id) {
            return NextResponse.json({ error: "Clothes ID is required" }, { status: 400 });
        }

        const cloth = await ClothesModel.findByIdAndUpdate(
            id,
            { $inc: { ordered: 1 } },
            { new: true }
        ).lean().exec();

        if (!cloth) {
            return NextResponse.json({ error: "Clothes not found" }, { status: 404 });
        }

        const clothesParsed = {
            ...cloth,
            _id: cloth._id.toString(),
        }
        const parsedClothes = ClothesSchema.safeParse(clothesParsed);
        if (!parsedClothes.success) {
            return NextResponse.json({ error: parsedClothes.error.message }, { status: 400 });
        }

        return NextResponse.json(parsedClothes.data, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: `Failed to update clothes: ${error.message}` }, { status: 500 });
    }
}
