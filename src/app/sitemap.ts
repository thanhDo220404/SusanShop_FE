import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2204";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE_URL}/san-pham`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/dang-nhap`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${SITE_URL}/dang-ky`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/product-categories`),
    ]);

    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();

    const products = productsData.Products || [];
    const categories = categoriesData.ProductCategories || [];

    const productRoutes = products
      .filter((p) => p.status && p.slug)
      .map((p) => ({
        url: `${SITE_URL}/san-pham/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const categoryRoutes = categories
      .filter((c) => c.status && c.slug)
      .map((c) => ({
        url: `${SITE_URL}/danh-muc/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
