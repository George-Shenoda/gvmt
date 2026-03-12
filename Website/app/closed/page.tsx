const ClosedPage = () => {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <svg 
                        className="w-12 h-12 text-primary/50" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground">
                    معلش فرصه طلب الهدوم خلصت
                </h1>
                
                <p className="text-muted-foreground">
                    مواعيد الطلب من السبت للثلاثاء
                </p>
                
                <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                        تابعنا عشان تعرف عندنا امتى الطلبات تفتح تاني
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClosedPage;
