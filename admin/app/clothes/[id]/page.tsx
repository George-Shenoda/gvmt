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
import { Clothes, ClothesSchema } from "@/schema/ClothesSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
// import z from "zod";

const page = () => {
    const form = useForm({
        resolver: zodResolver(ClothesSchema),
        defaultValues: {
            _id: "",
            name: "",
            image: "",
            max: 0,
            available: 0,
            ordered: 0,
        },
    });

    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const id = params.id as string;
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
        return (
            <Loading />
        );
    }

    // 2️⃣ Handle error / not found after loading
    if (isError || !cloth) {
        notFound();
    }

    const onSubmit = async (data: Clothes) => {
        startTransition(() => {
            console.log(data);
        });
    };
    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Edit Cloth
                </h1>
            </div>
            <Card className="max-w-xl w-full mx-auto">
                <CardHeader>
                    <CardTitle>Edit Cloth</CardTitle>
                    <CardDescription className="flex justify-center">
                        <Image
                            src={cloth.image}
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
                                            <FieldLabel>Name</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter the name"
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
                                            <FieldLabel>Max</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter the max"
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
                                            <FieldLabel>Available</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter the available"
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
                                            <FieldLabel>Image</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Enter the ordered"
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
                            <Button disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />{" "}
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    "Create Post"
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
            <div className="text-center mb-12">
            </div>
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