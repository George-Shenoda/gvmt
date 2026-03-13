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
import { Skeleton } from "@/components/ui/skeleton";
import { AddClothes, Clothes, ClothesSchema } from "@/schema/ClothesSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
// import z from "zod";

const page = () => {
    const form = useForm({
        resolver: zodResolver(ClothesSchema)
        defaultValues: {
            _id: "",
            name: "",
            image: { data: Buffer.from([]), contentType: "" },
            max: 0,
            available: 0,
            ordered: 0,
        },
    });

    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const router = useRouter()
    const id = params.id as string;
    const { mutateAsync: addClothes } = useMutation({
        mutationFn: async (formData: AddClothes) => {
            const res = await fetch(`/api/clothes/${id}`, {
                method: "PATCH",
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
    const {
        data: cloth,
        isError,
        isLoading,
    } = useQuery<Clothes>({
        queryKey: ["cloth", id],
        queryFn: async () => {
            const res = await fetch(`/api/clothes/${id}`);
            if (!res.ok) {
                throw new Error(`Failed to fetch cloth: ${res.statusText}`);
            }
            return res.json();
        },
    });
    useEffect(() => {
        if (cloth) {
            form.reset(cloth);
        }
    }, [cloth]);

    // 1️⃣ Show loader while fetching
    if (isLoading) {
        return <Loading />;
    }

    // 2️⃣ Handle error / not found after loading
    if (isError || !cloth) {
        notFound();
    }

    const onSubmit = async (formData: Clothes) => {
        startTransition(() => {
            addClothes(formData);
        });
    };

    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    تعديل اللبس
                </h1>
            </div>
            <Card className="max-w-xl w-full mx-auto">
                <CardHeader>
                    <CardTitle>تعديل اللبس</CardTitle>
                    <CardDescription className="flex justify-center">
                        <Image
                            src={`data:${cloth.image.contentType};base64,${cloth.image.data.toString("base64")}`}
                            alt={cloth.name}
                            width={300}
                            height={300}
                        />
                    </CardDescription>
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
                                                placeholder="الاسم"
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
                                                type="number"
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
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
                                                type="number"
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
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
                                        <span>تحديث...</span>
                                    </>
                                ) : (
                                    "تحديث"
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

const Loading = () => {
    return (
        <div className="py-12">
            <div className="text-center mb-12"></div>
            <Card className="max-w-xl w-full mx-auto">
                <CardHeader>
                    <CardDescription className="flex justify-center">
                        <Skeleton className="h-12 w-3/4" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-3/4" />
                </CardContent>
            </Card>
        </div>
    );
};
