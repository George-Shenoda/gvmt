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
}: {
    id: string;
    ordered: number;
    available: number;
    max: number;
}) => {
    const [authorized, setAuth] = useState(false);

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
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/clothes/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ operation: "add" }),
            });
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

    const handleClick = () => {
        mutation.mutate(id);
    };
    return authorized ? (
        <Button
            onClick={handleClick}
            className={`w-full ${Math.min(available - ordered, max - 0) >= 0 ? "cursor-pointer" : "cursor-not-allowed"}`}
            disabled={Math.min(available - ordered, max - 0) <= 0}
        >
            اضف للسلة
        </Button>
    ) : (
        <Link
            href="/signin"
            className={`w-full ${Math.min(available - ordered, max - 0) >= 0 ? "cursor-pointer" : "cursor-not-allowed"} ${buttonVariants()}`}
        >
            اضف للسلة
        </Link>
    );
};

export default AddToCart;
