"use client";

import { Clothes } from "@/schema/ClothesSchemas";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { id } from "zod/v4/locales";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { MinusIcon, PlusIcon } from "lucide-react";

type variable = {
    id: string;
    operation: "add" | "remove";
}

const CartStore = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (variable: variable) => {
            const res = await fetch(`/api/clothes/${variable.id}`, { method: "POST", body: JSON.stringify({ operation: variable.operation }) });
            if (!res.ok) {
                const text = await res.text();
                console.error("POST failed:", text);
                throw new Error("Failed to add to cart");
            }
            const data = await res.json();
            console.log("POST success data:", data);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData<Clothes[]>(["clothes"], (old) => {
                if (!old) return [];
                return old.map((cloth) =>
                    cloth._id === data._id
                        ? { ...cloth, ordered: data.ordered }
                        : cloth,
                );
            });
            toast.success("Added to cart");
        },
        onError: (error: any) => {
            console.error("Mutation onError:", error);
            toast.error(error.message);
        },
    });

    const handleClick = (variable: variable) => {
        mutation.mutate(variable);
    };
    const dummy = [
        {
            id: "1",
            name: "قميص",
            ordered: 0,
        },
        {
            id: "2",
            name: "قميص",
            ordered: 0,
        },
        {
            id: "3",
            name: "قميص",
            ordered: 0,
        },
    ];

    return (
        <Card className="w-100 mt-5 ">
            <CardHeader>
                <CardTitle>سلة التسوق</CardTitle>
                <CardDescription>طلباتك في هذا الأسبوع</CardDescription>
            </CardHeader>
            <CardContent>
                {dummy.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                        <p>{item.name}</p>
                        <p>{item.ordered}</p>
                        <div className="flex gap-2">
                            <Button onClick={() => handleClick({id: item.id, operation: "add"})}><PlusIcon /></Button>
                            <Button onClick={() => handleClick({id: item.id, operation: "remove"})}><MinusIcon /></Button>
                        </div>  
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button className="w-full">الانتقال للتاكيد</Button>
            </CardFooter>
        </Card>
    );
};

export default CartStore;
