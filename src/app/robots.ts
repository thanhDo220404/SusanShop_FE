import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dang-nhap", "/dang-ky", "/gio-hang"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
