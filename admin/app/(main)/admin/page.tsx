"use client";
import { useState, useEffect } from "react";
import { AdminUserSchemaType } from "@/schema/AdminUsersSchemas";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const page = () => {
    const [users, setUsers] = useState<AdminUserSchemaType[]>([]);
    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((res) => setUsers(res));
    }, []);
    const {mutateAsync: deleteUser, isSuccess: deleteSuccess,isError: deleteError} = useMutation({
        mutationFn: async (user: AdminUserSchemaType) => {
            await fetch(`/api/users/${user._id}`, {
                method: "DELETE",
            });
            setUsers(users.filter((u) => u._id !== user._id));
        }
    })
    const {mutateAsync: updateUser, isSuccess: updateSuccess, isError: updateError} = useMutation({
        mutationFn: async (user: AdminUserSchemaType) => {
            await fetch(`/api/users/${user._id}`, {
                method: "PUT",
                body: JSON.stringify(user),
            });
        }
    })
    useEffect(() => {
        if (deleteSuccess) {
            toast.success("تم حذف المستخدم");
        }
        if (deleteError) {
            toast.error("فشل حذف المستخدم");
        }
        if (updateSuccess) {
            toast.success("تم تحديث المستخدم");
        }
        if (updateError) {
            toast.error("فشل تحديث المستخدم");
        }
    }, [deleteSuccess, deleteError, updateSuccess, updateError]);
    return (
        <div className="container mx-auto py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                    <Card key={index}>
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>{user.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={async () => {
                                        await deleteUser(user);
                                    }}
                                >
                                    حذف
                                </Button>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex items-center gap-2 flex-row justify-center">
                            <FieldGroup className="flex items-center gap-2 flex-row">
                                <Label>نشط</Label>
                                <Input checked={user.active} type="checkbox" className="w-5 h-5" onChange={async () => {
                                    await updateUser({
                                        ...user,
                                        active: !user.active,
                                    });
                                    setUsers(users.map((u) => u._id === user._id ? {...u, active: !u.active} : u));
                                }}/>
                            </FieldGroup>
                            <FieldGroup className="flex items-center gap-2 flex-row">
                                <Label>مسؤول</Label>
                                <Input checked={user.role === "admin"} type="checkbox" className="w-5 h-5" onChange={async () => {
                                    await updateUser({
                                        ...user,
                                        role: user.role === "admin" ? "user" : "admin",
                                    });
                                    setUsers(users.map((u) => u._id === user._id ? {...u, role: u.role === "admin" ? "user" : "admin"} : u));
                                }}/>
                            </FieldGroup>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default page