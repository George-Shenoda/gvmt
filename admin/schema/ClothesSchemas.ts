import { z } from "zod";

export const ClothesSchema = z.object({
    _id: z.string(),
    name: z.string(),
    image: z.string(),
    max: z.number().min(0),
    available: z.number().min(0),
    ordered: z.number().min(0),
});

export const AddClothesSchema = ClothesSchema.omit({ _id: true, ordered: true });

export type Clothes = z.infer<typeof ClothesSchema>;
export type AddClothes = z.infer<typeof AddClothesSchema>;
