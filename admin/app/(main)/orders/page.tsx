"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp, Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type OrderItem = {
    _id?: string;
    clothesId?: string;
    name: string;
    quantity: number;
};

type Order = {
    _id: string;
    userRole: string;
    userId?: string;
    fridayDate?: string;
    items: OrderItem[];
    totalItems: number;
    submittedAt: string;
    submitted?: boolean;
};

type OrdersByDate = {
    date: string;
    orders: Order[];
    totalOrders: number;
    totalItems: number;
};

const OrdersPage = () => {
    const [orders, setOrders] = useState<OrdersByDate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
    const [showAllCarts, setShowAllCarts] = useState(false);

    const fetchOrders = useCallback(() => {
        fetch(`/api/orders?all=${showAllCarts}`)
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                if (data.length > 0) {
                    setExpandedDates(new Set([data[0].date]));
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch orders:", err);
                setIsLoading(false);
            });
    }, [showAllCarts]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateCartMutation = useMutation({
        mutationFn: async (data: { cartId: string; items: OrderItem[]; action: string }) => {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update cart");
            return res.json();
        },
        onSuccess: () => {
            toast.success("تم تحديث السلة بنجاح");
            setEditingOrderId(null);
            fetchOrders();
        },
        onError: () => {
            toast.error("فشل في تحديث السلة");
        },
    });

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(date)) {
                newSet.delete(date);
            } else {
                newSet.add(date);
            }
            return newSet;
        });
    };

    const startEditing = (order: Order) => {
        setEditingOrderId(order._id);
        setEditedItems([...order.items]);
    };

    const cancelEditing = () => {
        setEditingOrderId(null);
        setEditedItems([]);
    };

    const saveEditing = (orderId: string) => {
        const itemsToSave = editedItems
            .filter((item) => item.quantity > 0)
            .map((item) => ({
                name: item.name,
                clothesId: item.clothesId || "",
                quantity: item.quantity,
            }));
        
        updateCartMutation.mutate({
            cartId: orderId,
            items: itemsToSave,
            action: "updateItems",
        });
    };

    const updateItemQuantity = (index: number, quantity: number) => {
        const newItems = [...editedItems];
        newItems[index].quantity = Math.max(0, quantity);
        setEditedItems(newItems);
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto py-5 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">الطلبات</h1>
                    <Button 
                        variant={showAllCarts ? "default" : "outline"}
                        onClick={() => setShowAllCarts(!showAllCarts)}
                    >
                        {showAllCarts ? "إظهار الطلبات المقدمة فقط" : "إظهار كل السلات"}
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>الطلبات</CardTitle>
                        <CardDescription>لا توجد طلبات</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-5 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">الطلبات</h1>
                <Button 
                    variant={showAllCarts ? "default" : "outline"}
                    onClick={() => setShowAllCarts(!showAllCarts)}
                >
                    {showAllCarts ? "إظهار الطلبات المقدمة فقط" : "إظهار كل السلات"}
                </Button>
            </div>
            
            {orders.map((orderGroup) => (
                <Card key={orderGroup.date}>
                    <CardHeader 
                        className="cursor-pointer flex flex-row items-center justify-between"
                        onClick={() => toggleDate(orderGroup.date)}
                    >
                        <div>
                            <CardTitle className="text-xl">
                                {formatDate(orderGroup.date)}
                            </CardTitle>
                            <CardDescription>
                                {orderGroup.totalOrders} طلب | {orderGroup.totalItems} عنصر
                            </CardDescription>
                        </div>
                        {expandedDates.has(orderGroup.date) ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </CardHeader>
                    
                    {expandedDates.has(orderGroup.date) && (
                        <CardContent>
                            <div className="space-y-4">
                                {orderGroup.orders.map((order) => (
                                    <div 
                                        key={order._id} 
                                        className={`border rounded-lg p-4 ${order.submitted ? "bg-muted/30" : "bg-blue-50 border-blue-200"}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg">{order.userRole}</h3>
                                                {!order.submitted && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        لم يتم التقديم بعد
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {editingOrderId === order._id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => saveEditing(order._id)}
                                                            disabled={updateCartMutation.isPending}
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={cancelEditing}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => startEditing(order)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {editingOrderId === order._id ? (
                                            <div className="space-y-2 mt-3">
                                                {editedItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center">
                                                        <span className="text-sm">{item.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemQuantity(idx, parseInt(e.target.value) || 0)}
                                                                className="w-20 h-8"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{item.name}</span>
                                                        <span className="font-medium">× {item.quantity}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                                    <span>الإجمالي</span>
                                                    <span>× {order.totalItems}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default OrdersPage;
