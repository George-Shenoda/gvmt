"use client";

import { useForm, Controller } from "react-hook-form";
import { AdminUserSchema, AdminUserSchemaType } from "@/schema/AdminUsersSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SignupPage = () => {
    const [seePassword, setSeePassword] = useState(false);
    const router = useRouter();

    const mutation = useMutation<
        { accessToken: string },
        { message: string },
        AdminUserSchemaType
    >({
        mutationFn: async (data: AdminUserSchemaType) => {
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

    const form = useForm<AdminUserSchemaType>({
        resolver: zodResolver(AdminUserSchema),
        defaultValues: { password: "", name: "" },
    });

    const onSubmit = (data: AdminUserSchemaType) => mutation.mutate(data);
    useEffect(() => {
        if (mutation.isSuccess) {
            toast.success("تم انشاء الحساب");
            router.push("/");
        }
    }, [mutation.isSuccess]);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {mutation.isError && (
                <p className="text-red-500">{mutation.error.message}</p>
            )}
            <div className="flex items-center justify-center">
                <Card className="w-100">
                    <CardHeader className="text-center">
                        <CardTitle>انشاء حساب جديد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col mb-4 gap-3">
                                        <Label htmlFor="name">اسم المستخدم</Label>
                                        <Input
                                            {...field}
                                            id="name"
                                        />
                                        {fieldState.invalid && (
                                            <p className="text-red-500">
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
                                    <div className="flex flex-col mb-4 gap-3">
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
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-0"
                                                onClick={() =>
                                                    setSeePassword(!seePassword)
                                                }
                                            >
                                                {seePassword ? (
                                                    <Eye />
                                                ) : (
                                                    <EyeOff />
                                                )}
                                            </Button>
                                        </div>
                                        {fieldState.invalid && (
                                            <p className="text-red-500">
                                                {fieldState.error?.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            <div className="flex gap-2 justify-center">
                                <Button
                                    type="submit"
                                    className="w-1/2"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    انشاء حساب
                                </Button>
                                <Link
                                    href="/signin"
                                    className={`${buttonVariants({ variant: "outline" })} w-1/2`}
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;
