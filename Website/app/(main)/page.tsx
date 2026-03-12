import CardItem from "@/components/web/CardComponent";

export default function Home() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">ملابس GVMT</h1>
                <p className="text-muted-foreground">قسم الخدمات الكنسية - جيل الخدمة</p>
            </div>
            <CardItem />
        </div>
    );
}
