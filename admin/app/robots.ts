import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://gvmt-admin.vercel.app";

    return {
        rules: [
            {
                userAgent: "*",
                disallow: ["/", "/api/", "/_next/", "/admin/"],
            },
        ],
        host: baseUrl,
    };
}
