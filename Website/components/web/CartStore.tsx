"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { MinusIcon, PlusIcon, Loader2 } from "lucide-react";
import { Clothes } from "@/schema/ClothesSchemas";

type CartItem = {
    clothesId: string;
    name: string;
    quantity: number;
};

type CartData = {
    cart: {
        _id: string;
        items: CartItem[];
        submitted: boolean;
    };
    userRole: string;
    fridayDate: string;
};

const CartStore = () => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const { data, isLoading: isQueryLoading } = useQuery<CartData>({
        queryKey: ["cart"],
        queryFn: async () => {
            const res = await fetch("/api/cart");
            if (!res.ok) throw new Error("Failed to fetch cart");
            return res.json();
        },
    });

    const { data: clothesData } = useQuery<Clothes[]>({
        queryKey: ["clothes"],
        queryFn: async () => {
            const res = await fetch("/api/clothes");
            if (!res.ok) throw new Error("Failed to fetch clothes");
            return res.json();
        },
    });

    const localItems = data?.cart?.items || [];
    const isSubmitted = data?.cart?.submitted || false;
    const userRole = data?.userRole || "";
    const fridayDate = data?.fridayDate || "";
    const isLoading = isQueryLoading;

    const updateCartMutation = useMutation({
        mutationFn: async (items: CartItem[]) => {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });
            if (!res.ok) throw new Error("Failed to update cart");
            return res.json();
        },
        onSuccess: () => {
            setIsUpdating(false);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
            setIsUpdating(false);
        },
    });

    const submitCartMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/cart/submit", {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to submit cart");
            return res.json();
        },
        onSuccess: (data) => {
            toast.success(`تم تقديم الطلب بنجاح!\nالتاريخ: ${data.fridayDate}\nالاسم: ${data.userRole}`);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const handleQuantityChange = async (clothesId: string, delta: number) => {
        const currentItem = localItems.find((item) => item.clothesId === clothesId);
        const currentQty = currentItem?.quantity || 0;
        const newQty = currentQty + delta;
        
        if (delta > 0 && clothesData) {
            const cloth = clothesData.find((c) => c._id === clothesId);
            if (cloth) {
                const remaining = Math.min(cloth.available - cloth.ordered, cloth.max - currentQty);
                if (remaining <= 0) {
                    toast.error("لا يمكن اضافة المزيد من هذا العنصر");
                    return;
                }
            }
        }

        setIsUpdating(true);

        if (delta > 0) {
            await fetch(`/api/clothes/${clothesId}`, {
                method: "PATCH",
                body: JSON.stringify({ operation: "add", count: delta }),
            });
        } else {
            await fetch(`/api/clothes/${clothesId}`, {
                method: "PATCH",
                body: JSON.stringify({ operation: "remove", count: Math.abs(delta) }),
            });
        }
        queryClient.invalidateQueries({ queryKey: ["clothes"] });

        const updatedItems = localItems.map((item) => {
            if (item.clothesId === clothesId) {
                return { ...item, quantity: newQty };
            }
            return item;
        });

        updateCartMutation.mutate(updatedItems);
    };

    const handleSubmit = () => {
        if (localItems.length === 0) {
            toast.error("السلة فارغة");
            return;
        }
        submitCartMutation.mutate();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <Card className="w-100 mt-5">
                <CardHeader>
                    <CardTitle>سلة التسوق</CardTitle>
                    <CardDescription>جاري التحميل...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-100 mt-5">
            <CardHeader>
                <CardTitle>سلة التسوق</CardTitle>
                <CardDescription>
                    {userRole} - تاريخ الجمعة القادم: {formatDate(fridayDate)}
                    {isSubmitted && (
                        <span className="text-green-600 font-bold block mt-2">
                            ✓ تم تقديم الطلب - يمكنك التعديل حتى إغلاق الموقع
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {localItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">السلة فارغة</p>
                ) : (
                    localItems.map((item) => {
                        const cloth = clothesData?.find((c) => c._id === item.clothesId);
                        const remaining = cloth 
                            ? Math.min(cloth.available - cloth.ordered, cloth.max - item.quantity)
                            : 0;
                        return (
                        <div key={item.clothesId} className="flex justify-between items-center py-2 border-b">
                            <p className="font-medium">{item.name}</p>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold">{item.quantity}</span>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleQuantityChange(item.clothesId, 1)}
                                        disabled={isUpdating || remaining <= 0}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleQuantityChange(item.clothesId, -1)}
                                        disabled={isUpdating}
                                    >
                                        <MinusIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        );
                    })
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={localItems.length === 0 || submitCartMutation.isPending}
                >
                    {submitCartMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {isSubmitted ? "تعديل الطلب" : "تقديم الطلب"}
                </Button>
                {localItems.length > 0 && (
                    <p className="text-sm text-gray-500 text-center">
                        {localItems.length} عنصر {isSubmitted ? "(قيد التعديل)" : ""}
                    </p>
                )}
            </CardFooter>
        </Card>
    );
};

export default CartStore;
