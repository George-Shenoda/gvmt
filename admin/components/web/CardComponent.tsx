"use client";
import { Clothes, ClothesSchema } from "@/schema/ClothesSchemas";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
                <h2 className="text-2xl font-bold">No Clothes Added Yet</h2>
            </div>
        );
    }
    if (isSuccess) {
        return clothes.map((item, index) => (
            <div key={index} className="col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                            Available: {item.available - item.ordered}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src={item.image}
                            alt={item.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link
                            href={`/clothes/${item._id}`}
                            className={`w-full ${buttonVariants()}`}
                        >
                            Edit Item
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        ));
    }
}
