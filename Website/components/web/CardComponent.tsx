"use client";
import { Clothes } from "@/schema/ClothesSchemas";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Loader from "./ClothesLoader";
import AddToCart from "./AddToCart";

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
                <h2 className="text-2xl font-bold">مفيش ملابس حاليا</h2>
            </div>
        );
    }
    if (isSuccess) {
        return clothes.map((item) => (
            <div key={item._id} className="col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                            متاح: {Math.min(item.available - item.ordered, item.max - 0)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src={`data:${item.image.contentType};base64,${item.image.data.toString("base64")}`}
                            alt={item.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <AddToCart id={item._id} ordered={item.ordered} available={item.available} max={item.max} />
                    </CardFooter>
                </Card>
            </div>
        ));
    }
}
