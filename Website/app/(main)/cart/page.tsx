import CartStore from "@/components/web/CartStore";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";

const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

async function checkAuth() {
    const token = (await cookies()).get("accessToken")?.value;
    if (!token) {
        redirect("/signin");
    }
    try {
        await jwtVerify(token, secret);
    } catch {
        redirect("/signin");
    }
}

const page = async () => {
    await checkAuth();
    return (
        <div className="min-h-[100vh-64px] py-8 px-4">
            <div className="max-w-2xl mx-auto items-center justify-center flex flex-col">
                <div className="mb-6 flex items-center justify-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">سلة التسوق</h1>
                </div>
                <CartStore />
            </div>
        </div>
    );
};

export default page;
