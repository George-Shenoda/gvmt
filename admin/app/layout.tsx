import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/web/QueryProvider";
import { ThemeProvider } from "@/components/web/theme-provider";
import Navbar from "@/components/web/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "GVMT Admin Panel",
    description: "GVMT Admin Panel",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <QueryProvider>
                    <ThemeProvider attribute="class">
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
