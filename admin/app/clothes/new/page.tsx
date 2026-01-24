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
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
// import z from "zod";

const page = () => {
    const form = useForm({
        resolver: zodResolver(AddClothesSchema),
        defaultValues: {
            name: "",
            image: "",
            max: 0,
            available: 0,
        },
    });
    
    const [isPending, startTransition] = useTransition();

    const onSubmit = async (data: AddClothes) => {
        startTransition(() => {
            console.log(data);
        });
    };
    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Add New Clothes
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    Add new clothes to the store
                </p>
            </div>
            <Card className="max-w-xl w-full mx-auto">
                <CardHeader>
                    <CardTitle>Add New Clothes</CardTitle>
                    <CardDescription>Add new clothes to the store</CardDescription>
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
                                        <span>Creating...</span>
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
