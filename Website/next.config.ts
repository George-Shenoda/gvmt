import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["lucide-react", "@tanstack/react-query", "sonner", "zod"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
    },
};

export default nextConfig;
