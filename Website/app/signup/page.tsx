"use client";

import { useForm, Controller } from "react-hook-form";
import { UserSchema, UserSchemaType } from "@/schema/UserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SignupPage = () => {
    const [seePassword, setSeePassword] = useState(false);

    const router = useRouter();

    const mutation = useMutation<
        { accessToken: string },
        { message: string },
        UserSchemaType
    >({
        mutationFn: async (data: UserSchemaType) => {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw err;
            }
            return res.json();
        },
    });

    const form = useForm<UserSchemaType>({
        resolver: zodResolver(UserSchema),
        defaultValues: { password: "", role: "كيجي" },
    });

    const onSubmit = (data: UserSchemaType) => mutation.mutate(data);
    useEffect(() => {
        if (mutation.isSuccess) {
            toast.success("تم تسجيل الدخول");
            router.push("/");
        }
    }, [mutation.isSuccess, router]);
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
                    <CardTitle>انشاء حساب</CardTitle>
                    <CardDescription>سجل الان للانضمام لخدمة ملابس الكنيسة</CardDescription>
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

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="flex flex-col mb-6 gap-3">
                                    <Label htmlFor="password">
                                        كلمه المرور
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                seePassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute left-1 top-1/2 -translate-y-1/2 h-auto p-2"
                                            onClick={() =>
                                                setSeePassword(!seePassword)
                                            }
                                        >
                                            {seePassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {fieldState.invalid && (
                                        <p className="text-destructive text-sm">
                                            {fieldState.error?.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                                انشاء حساب
                            </Button>
                            <Link
                                href="/signin"
                                className={buttonVariants({ variant: "outline" })}
                            >
                                تسجيل الدخول
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <p className="mt-6 text-sm text-muted-foreground">
                عندك حساب؟ <Link href="/signin" className="text-primary hover:underline">سجل دخول</Link>
            </p>
        </div>
    );
};

export default SignupPage;
