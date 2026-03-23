"use client";
import { AdminUserSchemaType } from "@/schema/AdminUsersSchemas";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminPage() {
    const queryClient = useQueryClient();
    
    const { data: users = [], isLoading } = useQuery<AdminUserSchemaType[]>({
        queryKey: ["adminUsers"],
        queryFn: async () => {
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        },
    });

    const deleteUser = useMutation({
        mutationFn: async (user: AdminUserSchemaType) => {
            await fetch(`/api/users/${user._id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            toast.success("تم حذف المستخدم");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        },
        onError: () => {
            toast.error("فشل حذف المستخدم");
        },
    });

    const updateUser = useMutation({
        mutationFn: async (user: AdminUserSchemaType) => {
            await fetch(`/api/users/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
        },
        onSuccess: () => {
            toast.success("تم تحديث المستخدم");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        },
        onError: () => {
            toast.error("فشل تحديث المستخدم");
        },
    });

    if (isLoading) {
        return (
            <div className="container mx-auto py-5">
                <p>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                    <Card key={user._id}>
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>{user.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => deleteUser.mutate(user)}
                                    disabled={deleteUser.isPending}
                                >
                                    حذف
                                </Button>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex items-center gap-2 flex-row justify-center">
                            <FieldGroup className="flex items-center gap-2 flex-row">
                                <Label>نشط</Label>
                                <Input 
                                    checked={user.active} 
                                    type="checkbox" 
                                    className="w-5 h-5" 
                                    onChange={() => updateUser.mutate({ ...user, active: !user.active })}
                                />
                            </FieldGroup>
                            <FieldGroup className="flex items-center gap-2 flex-row">
                                <Label>مسؤول</Label>
                                <Input 
                                    checked={user.role === "admin"} 
                                    type="checkbox" 
                                    className="w-5 h-5" 
                                    onChange={() => updateUser.mutate({ ...user, role: user.role === "admin" ? "user" : "admin" })}
                                />
                            </FieldGroup>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}