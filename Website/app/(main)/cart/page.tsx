import CartStore from "@/components/web/CartStore";

const page = () => {
    return (
        <div className="flex flex-col container mx-auto py-5 justify-between items-center h-[calc(100vh-8rem)]">
            <h1 className="text-2xl font-bold">سلة التسوق</h1>
            <CartStore />
            <div></div>
        </div>
    );
};

export default page;
