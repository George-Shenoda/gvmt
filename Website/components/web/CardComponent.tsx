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

    const { data: cartData } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const res = await fetch("/api/cart");
            if (!res.ok) return null;
            return res.json();
        },
    });

    if (isLoading) {
        return <Loader />;
    }
    if (!clothes || clothes.length === 0 || !isSuccess) {
        return (
            <div className="container mx-auto min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground/70">مفيش ملابس حالياً</h2>
                    <p className="text-muted-foreground">توقعونا قريباً بملابس جديدة</p>
                </div>
            </div>
        );
    }
    if (isSuccess) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clothes.map((item) => {
                    const cartItem = cartData?.cart?.items?.find((i: { clothesId: string }) => i.clothesId === item._id);
                    const inCartQty = cartItem?.quantity || 0;
                    return (
                        <Card key={item._id} className="overflow-hidden border-primary/20 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-3 space-y-2">
                                <CardTitle className="text-lg font-semibold line-clamp-1">{item.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        متاح: {Math.min(item.available - item.ordered, item.max - inCartQty)}
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
                            <CardFooter className="pt-4">
                                <AddToCart 
                                    id={item._id} 
                                    ordered={item.ordered} 
                                    available={item.available} 
                                    max={item.max} 
                                    incart={inCartQty}
                                />
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    }
}
