import CardItem from "@/components/web/CardComponent";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="container mx-auto py-5">
              <div className="flex justify-end items-center mb-5">
                <Link href="/clothes/new" className={`text-white px-4 py-2 rounded ${buttonVariants()}`}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New
                </Link>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CardItem />
                </div>
            </div>
        </>
    );
}
