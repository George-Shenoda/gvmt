"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

type OrderItem = {
    name: string;
    quantity: number;
};

type Order = {
    _id: string;
    userRole: string;
    items: OrderItem[];
    totalItems: number;
    submittedAt: string;
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

    useEffect(() => {
        fetch("/api/orders")
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
    }, []);

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
            <div className="container mx-auto py-5">
                <Card>
                    <CardHeader>
                        <CardTitle>الطلبات</CardTitle>
                        <CardDescription>لا توجد طلبات مقدمه</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-5 space-y-4">
            <h1 className="text-2xl font-bold">الطلبات</h1>
            
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
                                        className="border rounded-lg p-4 bg-muted/30"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{order.userRole}</h3>
                                            <span className="text-sm text-muted-foreground">
                                                {order.totalItems} عنصر
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.name}</span>
                                                    <span className="font-medium">× {item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
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
