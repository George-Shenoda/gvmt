"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { roles } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
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
        "أاجتماع الانبا موسي",
    ]),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
});

type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const router = useRouter();
    const [seePassword, setSeePassword] = useState(false);

    const mutation = useMutation<
        { message: string },
        { message: string },
        ForgotPasswordType
    >({
        mutationFn: async (data: ForgotPasswordType) => {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: data.role, password: data.password }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw err;
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("تم تغيير كلمة المرور بنجاح");
            router.push("/signin");
        },
    });

    const form = useForm<ForgotPasswordType>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: { role: "كيجي", password: "", confirmPassword: "" },
    });

    const onSubmit = (data: ForgotPasswordType) => mutation.mutate(data);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-primary/5">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                    <Image
                        src="/logo.png"
                        alt="GVMT"
                        width={64}
                        height={64}
                        className="rounded-md"
                    />
                </div>
                <h1 className="text-2xl font-bold">GVMT</h1>
                <p className="text-muted-foreground">الخدمات الكنسية</p>
            </div>
            
            {mutation.isError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {mutation.error.message}
                </div>
            )}
            
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>نسيت كلمة المرور</CardTitle>
                    <CardDescription>أدخل دورك وكلمة المرور الجديدة</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Controller
                            name="role"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col mb-4 gap-3">
                                    <Label htmlFor="role">المرحله</Label>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختار المرحله" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <p className="text-destructive text-sm">
                                            {fieldState.error?.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <div className="flex flex-col mb-4 gap-3">
                            <Label htmlFor="password">كلمة المرور الجديدة</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={seePassword ? "text" : "password"}
                                    {...form.register("password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute left-1 top-1/2 -translate-y-1/2 h-auto p-2"
                                    onClick={() => setSeePassword(!seePassword)}
                                >
                                    {seePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-destructive text-sm">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col mb-6 gap-3">
                            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...form.register("confirmPassword")}
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-destructive text-sm">
                                    {form.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            )}
                            تغيير كلمة المرور
                        </Button>
                    </form>
                </CardContent>
            </Card>
            
            <p className="mt-6 text-sm text-muted-foreground">
                تذكرت كلمة المرور؟ <Link href="/signin" className="text-primary hover:underline">سجل دخول</Link>
            </p>
        </div>
    );
};

export default ForgotPasswordPage;
