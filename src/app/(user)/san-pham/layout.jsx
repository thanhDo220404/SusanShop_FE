const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn";

export const metadata = {
  title: "Tất cả sản phẩm",
  description:
    "Khám phá bộ sưu tập thời trang nam cao cấp tại Susan Shop: áo thun, áo polo, quần kaki, quần jeans chất lượng, giá tốt.",
  openGraph: {
    title: "Tất cả sản phẩm | Susan Shop",
    description: "Khám phá bộ sưu tập thời trang nam cao cấp tại Susan Shop.",
    siteName: "Susan Shop",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${SITE_URL}/san-pham`,
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
