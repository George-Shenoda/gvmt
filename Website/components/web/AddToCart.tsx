"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Clothes } from "@/schema/ClothesSchemas";
import { useEffect, useState } from "react";
import Link from "next/link";

type AuthState = {
    authorized: boolean;
};

const AddToCart = ({
    id,
    ordered,
    available,
    max,
    incart,
}: {
    id: string;
    ordered: number;
    available: number;
    max: number;
    incart: number;
}) => {
    const [authorized, setAuth] = useState(false);
    const [localQuantity, setLocalQuantity] = useState(0);

    useEffect(() => {
        fetch("/api/auth", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((res: AuthState) => setAuth(res.authorized))
            .catch(() => setAuth(false));
    }, []);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
            const res = await fetch(`/api/clothes/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ operation: "add", count: quantity }),
            });
            if (!res.ok) {
                const text = await res.text();
                console.error("PATCH failed:", text);
                throw new Error("Failed to add to cart");
            }
            const data = await res.json();

            const cartRes = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{ clothesId: id, quantity }],
                    operation: "add",
                }),
            });
            if (!cartRes.ok) {
                const text = await cartRes.text();
                console.error("Cart POST failed:", text);
                throw new Error("Failed to add to cart");
            }
            const cartData = await cartRes.json();

            return { data, quantity };
        },
        onSuccess: ({ data, quantity }) => {
            queryClient.setQueryData<Clothes[]>(["clothes"], (old) => {
                if (!old) return [];
                return old.map((cloth) =>
                    cloth._id === data._id
                        ? { ...cloth, ordered: data.ordered }
                        : cloth,
                );
            });
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            toast.success(`Added ${quantity} to cart`);
            setLocalQuantity(0);
        },
        onError: (error: Error) => {
            console.error("Mutation onError:", error);
            toast.error(error.message);
        },
    });

    const handleClick = async () => {
        const remaining = Math.min(available - ordered, max - incart);
        if (remaining <= 0) {
            toast.error("لا يمكن اضافة المزيد من هذا العنصر");
            return;
        }
        const newQuantity = localQuantity + 1;
        setLocalQuantity(newQuantity);
        try {
            await mutation.mutateAsync({ id, quantity: newQuantity });
        } catch {
            // Error handled in onError
        }
    };

    const remaining = Math.min(available - ordered, max - incart);
    return authorized ? (
        <Button
            onClick={handleClick}
            className={`w-full ${remaining >= 0 ? "cursor-pointer" : "cursor-not-allowed"}`}
            disabled={remaining <= 0}
        >
            اضف للسلة {localQuantity > 0 ? `(${localQuantity})` : ""}
        </Button>
    ) : (
        <Link
            href="/signin"
            className={`w-full ${remaining >= 0 ? "cursor-pointer" : "cursor-not-allowed"} ${buttonVariants()}`}
        >
            اضف للسلة
        </Link>
    );
};

export default AddToCart;
