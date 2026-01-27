import {z} from "zod";

export const AdminUserSchema = z.object({
    name: z.string().min(3).max(255),
    password: z.string().min(8).max(255),
})

export type AdminUserSchemaType = z.infer<typeof AdminUserSchema>

