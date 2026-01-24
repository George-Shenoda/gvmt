"use client";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ModeToggle } from "./theme-toggle";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <header className="flex items-center justify-between py-4 container mx-auto top-0 z-50">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="GVMT"
                            width={100}
                            height={50}
                        />
                    </Link>
                </div>
                <div className="items-center gap-4 text-xl hidden md:flex">
                    <Link href="/">Home</Link>
                    <Link href="/orders">Orders</Link>
                </div>
                <div className="items-center gap-2 hidden md:flex">
                    <Link
                        href="/signin"
                        className={`cursor-pointer ${buttonVariants()}`}
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className={`cursor-pointer ${buttonVariants({ variant: "outline" })}`}
                    >
                        Sign Up
                    </Link>
                    <ModeToggle />
                </div>
                <div className="md:hidden">
                    <MenuIcon onClick={() => setOpen(true)} />
                </div>
            </header>
            <div
                className={`fixed z-200 top-0 left-0 h-full w-full bg-sidebar text-sidebar-foreground shadow-lg transform transition-transform duration-500 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col items-end w-screen pt-4">
                    <XIcon onClick={() => setOpen(false)} />
                </div>
                <div className="flex flex-col gap-4 w-screen px-3">
                    <Link href="/">Home</Link>
                    <Link href="/orders">Orders</Link>
                    <Link
                        href="/signin"
                        className={`cursor-pointer ${buttonVariants()}`}
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/signup"
                        className={`cursor-pointer ${buttonVariants({ variant: "outline" })}`}
                    >
                        Sign Up
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </>
    );
};

export default Navbar;
