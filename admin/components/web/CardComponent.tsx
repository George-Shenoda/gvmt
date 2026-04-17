"use client";
import { memo } from "react";
import { Clothes } from "@/schema/ClothesSchemas";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Loader from "./ClothesLoader";
import Link from "next/link";

const ClothCard = memo(function ClothCard({ item }: { item: Clothes }) {
    return (
        <Card className="overflow-hidden border-primary/20 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3 space-y-2">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                    {item.name}
                </CardTitle>

                <CardDescription className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        متوفر: {item.available - item.ordered}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    <Image
                        src={`data:${item.image.contentType};base64,${item.image.data.toString("base64")}`}
                        alt={item.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link
                    href={`/clothes/${item._id}`}
                    className={`w-full ${buttonVariants()}`}
                >
                    تعديل
                </Link>
            </CardFooter>
        </Card>
    );
});

export default function CardItem() {
    const {
        data: clothes,
        isLoading,
        isSuccess,
    } = useQuery<Clothes[]>({
        queryKey: ["clothes"],
        queryFn: async () => {
            const res = await fetch("/api/clothes");
            if (!res.ok) throw new Error("Failed to fetch clothes");
            return res.json();
        },
        refetchInterval: 1000 * 60 * 15,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });

    if (isLoading) {
        return <Loader />;
    }
    if (!clothes || clothes.length === 0 || !isSuccess) {
        return (
            <div className="container mx-auto w-screen h-[calc(100vh-8rem)] flex items-center justify-center">
                <h2 className="text-2xl font-bold">مفيش لبس</h2>
            </div>
        );
    }
    if (isSuccess) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clothes.map((item) => (
                    <div key={item._id} className="col-span-1">
                        <ClothCard item={item} />
                    </div>
                ))}
            </div>
        );
    }
}
