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
import { Clothes, EditClothes } from "@/schema/ClothesSchemas";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditClothesPage() {
    const [hasNewImage, setHasNewImage] = useState(false);
    
    const form = useForm({
        defaultValues: {
            _id: "",
            name: "",
            max: 0,
            available: 0,
            ordered: 0,
            image: {
                data: Buffer.from("", "base64"),
                contentType: "",
            },
        },
    });

    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const id = params.id as string;
    const { mutateAsync: updateClothes } = useMutation({
        mutationFn: async (formData: EditClothes) => {
            const updateData: Record<string, unknown> = {
                name: formData.name,
                max: formData.max,
                available: formData.available,
            };

            if (hasNewImage && formData.image) {
                updateData.image = {
                    data: formData.image.data.toString("base64"),
                    contentType: formData.image.contentType,
                };
            }

            const res = await fetch(`/api/clothes/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });
            if (!res.ok) throw new Error("Failed to update clothes");
            return res.json();
        },
        onSuccess: () => {
            toast.success("تم تحديث الملابس");
            router.push("/");
        },
    });

    const { mutateAsync: deleteClothes } = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/clothes/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete clothes");
            return res.json();
        },
        onSuccess: () => {
            toast.success("تم حذف الملابس");
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
            const { image: _image, ...rest } = cloth;
            form.reset({
                ...rest,
                max: Number(rest.max),
                available: Number(rest.available),
                ordered: Number(rest.ordered),
            });
        }
    }, [cloth, form]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !cloth) {
        notFound();
    }

    const onSubmit = async (formData: EditClothes) => {
        startTransition(() => {
            updateClothes(formData);
        });
    };

    const handleDelete = () => {
        if (confirm("هل أنت متأكد من حذف هذا الملء؟")) {
            startTransition(() => {
                deleteClothes();
            });
        }
    };

    const currentImage = hasNewImage && (form.getValues("image")?.data?.length ?? 0) > 0
        ? `data:${form.getValues("image")?.contentType};base64,${form.getValues("image")?.data.toString("base64")}`
        : cloth?.image?.data
            ? `data:${cloth.image.contentType};base64,${cloth.image.data.toString("base64")}`
            : null;

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
                        {currentImage && (
                            <Image
                                src={currentImage}
                                alt={cloth.name}
                                width={300}
                                height={300}
                            />
                        )}
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
                                                onChange={(e) => {
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    );
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
                                                onChange={(e) => {
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    );
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
                            <Controller
                                name="image"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    return (
                                        <Field>
                                            <FieldLabel>الصورة (اختياري - اتركه فارغاً للاحتفاظ بالصورة الحالية)</FieldLabel>
                                            <Input
                                                accept="image/*"
                                                type="file"
                                                onChange={async (e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (file) {
                                                        setHasNewImage(true);
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
                            <div className="flex gap-3">
                                <Button type="submit" disabled={isPending} className="flex-1">
                                    {isPending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />{" "}
                                            <span>تحديث...</span>
                                        </>
                                    ) : (
                                        "تحديث"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

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
