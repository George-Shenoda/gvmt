import { z } from "zod";

export const CartItemSchema = z.object({
    clothesId: z.string(),
    quantity: z.number().min(0),
});

export const CartSchema = z.object({
    userId: z.string(),
    fridayDate: z.string(),
    items: z.array(CartItemSchema),
    submitted: z.boolean().optional(),
});

export const UpdateCartSchema = z.object({
    items: z.array(CartItemSchema),
});

export const SubmitCartSchema = z.object({
    fridayDate: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
