import { z } from "zod";

export const AdminUserSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
    role: z.enum(["admin", "user"]).optional(),
    active: z.boolean().optional(),
})

export type AdminUserSchemaType = z.infer<typeof AdminUserSchema>
