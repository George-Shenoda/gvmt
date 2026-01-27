"use client";

import { useForm, Controller } from "react-hook-form";
import { UserSchema, UserSchemaType } from "@/schema/UserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { roles } from "@/lib/roles";
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
        UserSchemaType
    >({
        mutationFn: async (data: UserSchemaType) => {
            const res = await fetch("/api/signin", {
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
    }, [mutation.isSuccess]);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {mutation.isError && (
                <p className="text-red-500">{mutation.error.message}</p>
            )}
            <div className="flex items-center justify-center">
                <Card className="w-100">
                    <CardHeader className="text-center">
                        <CardTitle>تسجيل الدخول</CardTitle>
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
                                    تسجيل الدخول
                                </Button>
                                <Link
                                    href="/signup"
                                    className={`${buttonVariants({ variant: "outline" })} w-1/2`}
                                >
                                    انشاء حساب
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
