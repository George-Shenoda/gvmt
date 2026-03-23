import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/web/theme-provider";
import { Toaster } from "sonner";
import QueryProvider from "@/components/web/QueryProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL("https://gvmt-two.vercel.app"),
    title: {
        default: "GVMT - ملابس الكنيسة",
        template: "%s | GVMT",
    },
    description: "قسم الخدمات الكنسية - جيل الخدمة - ملابس كنسية عالية الجودة",
    keywords: ["ملابس كنسية", "خدمات كنسية", "جيل الخدمة", "ملابس كنيسة"],
    openGraph: {
        type: "website",
        locale: "ar_AR",
        url: "https://gvmt-two.vercel.app",
        siteName: "GVMT",
        title: "GVMT - ملابس الكنيسة",
        description: "قسم الخدمات الكنسية - جيل الخدمة - ملابس كنسية عالية الجودة",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "GVMT - ملابس الكنيسة",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "GVMT - ملابس الكنيسة",
        description: "قسم الخدمات الكنسية - جيل الخدمة - ملابس كنسية عالية الجودة",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen`}
            >
                <QueryProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
