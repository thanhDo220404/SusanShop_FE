const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2204";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    const product = (data.Products || []).find((p) => p.slug === slug);

    if (!product) {
      return { title: "Không tìm thấy sản phẩm" };
    }

    const firstImage = product.images?.[0]?.url || product.images?.[0]?.secure_url;
    const description = product.description?.replace(/<[^>]*>/g, "").substring(0, 160) || product.name;

    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        type: "website",
        images: firstImage ? [{ url: firstImage, width: 800, height: 800 }] : [],
        siteName: "Susan Shop",
        locale: "vi_VN",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: firstImage ? [firstImage] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/san-pham/${slug}`,
      },
    };
  } catch {
    return { title: "Susan Shop" };
  }
}

export default function ProductDetailLayout({ children }) {
  return children;
}
