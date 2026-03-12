import { NextResponse } from "next/server";
import ClothesModel from "@/models/Clothes";
import connectToDB from "@/lib/mongodb";
import { ClothesSchema } from "@/schema/ClothesSchemas";
import { Binary } from "mongodb";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
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

        // Convert Buffer to Base64 for JSON serialization
        const clothParsed = {
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

        const validated = ClothesSchema.safeParse(clothParsed);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.message },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                ...validated.data,
                image: validated.data.image
                    ? {
                          data: validated.data.image.data.toString("base64"),
                          contentType: validated.data.image.contentType,
                      }
                    : undefined,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to fetch clothes ${error}` },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const { operation, count } = await request.json();
    const increment = operation === "add" ? (count || 1) : (operation === "remove" ? -(count || 1) : 0);
    try {
        await connectToDB();

        if (!id) {
            return NextResponse.json(
                { error: "Clothes ID is required" },
                { status: 400 },
            );
        }
        const cloth = await ClothesModel.findByIdAndUpdate(
            id,
            { $inc: { ordered: increment } },
            { new: true },
        )
            .lean()
            .exec();

        if (!cloth) {
            return NextResponse.json(
                { error: "Clothes not found" },
                { status: 404 },
            );
        }

        const clothesParsed = {
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
        const parsedClothes = ClothesSchema.safeParse(clothesParsed);
        if (!parsedClothes.success) {
            return NextResponse.json(
                { error: parsedClothes.error.message },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                ...parsedClothes.data,
                image: parsedClothes.data.image
                    ? {
                          data: parsedClothes.data.image.data.toString(
                              "base64",
                          ),
                          contentType: parsedClothes.data.image.contentType,
                      }
                    : undefined,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: `Failed to update clothes: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 },
        );
    }
}
