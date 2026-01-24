import { z } from "zod";

export const ClothesSchema = z.object({
    name: z.string(),
    image: z.string(),
    max: z.number().min(0),
    available: z.number().min(0),
    ordered: z.number().min(0),
});

export const ClothesSchemaUpdate = ClothesSchema.pick({ ordered: true });

export type Clothes = z.infer<typeof ClothesSchema>;
export type ClothesUpdate = z.infer<typeof ClothesSchemaUpdate>;
