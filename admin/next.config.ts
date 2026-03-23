import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        optimizePackageImports: ["lucide-react", "@tanstack/react-query", "sonner", "zod"],
    },
};

export default nextConfig;
