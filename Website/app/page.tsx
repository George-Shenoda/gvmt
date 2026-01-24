import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import CardItem from "@/components/web/CardComponent";

export default function Home() {
    return (
        <>
            <div className="container mx-auto py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CardItem />
                </div>
            </div>
        </>
    );
}
