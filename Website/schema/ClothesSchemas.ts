import { z } from "zod";

export const ClothesSchema = z.object({
    _id: z.string(),
    name: z.string(),
    image: z.object({
        data: z.instanceof(Buffer),
        contentType: z.string(),
    }),
    max: z.number().min(0),
    available: z.number().min(0),
    ordered: z.number().min(0),
});

export type Clothes = z.infer<typeof ClothesSchema>;
