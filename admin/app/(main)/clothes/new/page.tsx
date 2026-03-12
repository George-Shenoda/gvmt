"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AddClothesSchema, AddClothes } from "@/schema/ClothesSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const page = () => {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(AddClothesSchema),
        defaultValues: {
            name: "",
            image: { data: Buffer.from([]), contentType: "" },
            max: 0,
            available: 0,
        },
    });

    const {mutateAsync: addClothes} = useMutation({
        mutationFn: async (formData: AddClothes) => {
            const res = await fetch("/api/clothes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    // convert Buffer to base64 string to send over JSON
                    image: {
                        data: formData.image.data.toString("base64"),
                        contentType: formData.image.contentType,
                    },
                }),
            });
            if (!res.ok) throw new Error("Failed to add clothes");
            return res.json();
        },
        onSuccess: () => {
            toast.success("تم إضافة الملابس");
            router.push("/");
        },
    });

    const [isPending, startTransition] = useTransition();

    const onSubmit = async (formData: AddClothes) => {
        startTransition(() => {
            addClothes(formData);
        });
    };
    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    أضف ملابس جديدة
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    أضف ملابس جديدة للخزنة
                </p>
            </div>
            <Card className="max-w-xl w-full mx-auto">
                <CardHeader>
                    <CardTitle>أضف ملابس جديدة</CardTitle>
                    <CardDescription>أضف ملابس جديدة للخزنة</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-y-4">
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field>
                                            <FieldLabel>الاسم</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="أدخل الاسم"
                                            />
                                            {fieldState.error && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            <Controller
                                name="max"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field>
                                            <FieldLabel>الحد الأقصى</FieldLabel>
                                            <Input
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.valueAsNumber,
                                                    )
                                                }
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                type="number"
                                            />
                                            {fieldState.error && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            <Controller
                                name="available"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field>
                                            <FieldLabel>المتاح</FieldLabel>
                                            <Input
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.valueAsNumber,
                                                    )
                                                }
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                type="number"
                                            />
                                            {fieldState.error && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            <Controller
                                name="image"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field>
                                            <FieldLabel>الصورة</FieldLabel>
                                            <Input
                                                accept="image/*"
                                                type="file"
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        const arrayBuffer =
                                                            await file.arrayBuffer();
                                                        const buffer =
                                                            Buffer.from(
                                                                arrayBuffer,
                                                            );
                                                        field.onChange({
                                                            data: buffer,
                                                            contentType:
                                                                file.type,
                                                        });
                                                    }
                                                }}
                                            />
                                            {fieldState.error && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            <Button disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />{" "}
                                        <span>جاري إضافة...</span>
                                    </>
                                ) : (
                                    "إضافة"
                                )}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default page;
