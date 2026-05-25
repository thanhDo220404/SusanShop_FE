const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2204";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/product-categories`);
    const data = await res.json();
    const category = (data.ProductCategories || []).find((c) => c.slug === slug);

    if (!category) {
      return { title: "Không tìm thấy danh mục" };
    }

    return {
      title: category.name,
      description: category.description || `Sản phẩm ${category.name} chất lượng cao tại Susan Shop`,
      openGraph: {
        title: `${category.name} | Susan Shop`,
        description: category.description || `Sản phẩm ${category.name} tại Susan Shop`,
        siteName: "Susan Shop",
        locale: "vi_VN",
      },
      alternates: {
        canonical: `${SITE_URL}/danh-muc/${slug}`,
      },
    };
  } catch {
    return { title: "Susan Shop" };
  }
}

export default function CategoryLayout({ children }) {
  return children;
}
