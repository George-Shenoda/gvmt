import { z } from "zod";

export const UserSchema = z.object({
    password: z.string().min(8).max(32),
    role: z.enum([
        "كيجي",
        "اولي وتانيه",
        "تالته ورابعه بنين",
        "تالته ورابعه بنات",
        "خامسه وسادسه بنين",
        "خامسه وسادسه بنات",
        "اعدادي بنين",
        "اعدادي بنات",
        "ثانوي بنين",
        "ثانوي بنات",
        "شباب",
        "خريجين",
        "الحكمه",
        "مار يوحنا",
        "اخوه الرب",
        "مدرسه الشمامسه",
        "خدمه مستر بيتر سامي",
    ]),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
export const LoginSchema = UserSchema.pick({
    password: true,
    role: true,
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
