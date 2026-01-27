import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";
import { Binary } from "mongodb";

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
                _id: cloth._id.toString(),
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