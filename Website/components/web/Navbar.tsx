"use client";
import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "../ui/button";
import { ModeToggle } from "./theme-toggle";
import { MenuIcon, XIcon, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

type AuthState = {
    authorized: boolean;
};

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [auth, setAuth] = useState(false);

    useEffect(() => {
        fetch("/api/auth", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((res: AuthState) => setAuth(res.authorized))
            .catch(() => setAuth(false));
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="GVMT"
                                width={40}
                                height={40}
                                className="rounded-md"
                            />
                        </Link>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-8">
                        <Link 
                            href="/" 
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            الرئيسية
                        </Link>
                        <Link 
                            href="/cart" 
                            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            سلة المشتريات
                        </Link>
                    </nav>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2">
                            {!auth && (
                                <>
                                    <Link
                                        href="/signin"
                                        className={buttonVariants({ variant: "outline", size: "sm" })}
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className={buttonVariants({ size: "sm" })}
                                    >
                                        انشاء حساب
                                    </Link>
                                </>
                            )}
                            {auth && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        fetch("/api/logout", { method: "POST" });
                                        setAuth(false);
                                    }}
                                >
                                    تسجيل الخروج
                                </Button>
                            )}
                        </div>
                        <ModeToggle />
                        <button 
                            className="md:hidden p-2"
                            onClick={() => setOpen(true)}
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-100 bg-background/98 backdrop-blur transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="container mx-auto flex flex-col h-full p-4">
                    <div className="flex justify-between items-center mb-8">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                            <Image
                                src="/logo.png"
                                alt="GVMT"
                                width={40}
                                height={40}
                                className="rounded-md"
                            />
                        </Link>
                        <button onClick={() => setOpen(false)}>
                            <XIcon className="h-8 w-8" />
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-4 text-lg">
                        <Link 
                            href="/" 
                            onClick={() => setOpen(false)}
                            className="p-3 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            الرئيسية
                        </Link>
                        <Link 
                            href="/cart" 
                            onClick={() => setOpen(false)}
                            className="p-3 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            سلة المشتريات
                        </Link>
                        
                        <div className="border-t my-4"></div>
                        
                        {!auth && (
                            <>
                                <Link
                                    href="/signin"
                                    onClick={() => setOpen(false)}
                                    className={buttonVariants({ variant: "outline" })}
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setOpen(false)}
                                    className={buttonVariants()}
                                >
                                    انشاء حساب
                                </Link>
                            </>
                        )}
                        {auth && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    fetch("/api/logout", { method: "POST" });
                                    setAuth(false);
                                    setOpen(false);
                                }}
                            >
                                تسجيل الخروج
                            </Button>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Navbar;
