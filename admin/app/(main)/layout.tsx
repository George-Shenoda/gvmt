import Navbar from "@/components/web/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default layout;
