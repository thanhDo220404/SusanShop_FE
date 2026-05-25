import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "@/contexts/auth";
import { CartProvider } from "@/contexts/cart";
import Header from "@/app/components/header";
import Footer from "../components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://susanshop.vn"),
  title: {
    default: "Susan Shop - Thời Trang Nam Cao Cấp",
    template: "%s | Susan Shop",
  },
  description:
    "Susan Shop - Cửa hàng thời trang nam cao cấp với áo thun, áo polo, quần kaki, quần jeans chất lượng. Miễn phí giao hàng, đổi trả dễ dàng.",
  keywords: [
    "thời trang nam",
    "áo thun nam",
    "áo polo",
    "quần kaki",
    "quần jeans",
    "susan shop",
    "thời trang cao cấp",
  ],
  authors: [{ name: "Susan Shop" }],
  creator: "Susan Shop",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Susan Shop",
    title: "Susan Shop - Thời Trang Nam Cao Cấp",
    description:
      "Cửa hàng thời trang nam cao cấp với áo thun, áo polo, quần kaki, quần jeans chất lượng.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Susan Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Susan Shop - Thời Trang Nam Cao Cấp",
    description:
      "Cửa hàng thời trang nam cao cấp với áo thun, áo polo, quần kaki, quần jeans chất lượng.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
