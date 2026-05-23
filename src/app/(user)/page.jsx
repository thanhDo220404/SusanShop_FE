"use client";
import { useEffect, useState } from "react";
import Banner from "../components/banner";
import ProductCard from "../components/productCard";
import ProductSlider from "../components/productSliders";
import { api } from "@/lib/api";
import { expandProductsByColor } from "@/lib/products";
import Link from "next/link";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [products, variants] = await Promise.all([
          api.products.getAll(),
          api.variants.getAll(),
        ]);
        const productsWithVariants = products.map((p) => ({
          ...p,
          variants: variants.filter((v) => {
            const vProdId = v.product_id?._id || v.product_id;
            return vProdId === p._id;
          }),
        }));
        setAllProducts(productsWithVariants);
        const featuredRaw = productsWithVariants.filter((p) => p.features);
        setFeatured(expandProductsByColor(featuredRaw));
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }
    fetchData();
  }, []);

  const displayProducts = expandProductsByColor(allProducts);

  return (
    <>
      <Banner />

      {featured.length > 0 && (
        <div className="container-fluid px-lg-5 my-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0">San pham noi bat</h2>
            <Link
              href="/san-pham"
              className="text-decoration-none text-dark fw-semibold"
            >
              Xem them -
            </Link>
          </div>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      {displayProducts.length > 0 && (
        <ProductSlider
          title="San pham noi bat"
          link="/san-pham"
          products={displayProducts.slice(0, 12)}
          renderItem={(item) => <ProductCard product={item} />}
        />
      )}

      {allProducts.length === 0 && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Dang tai...</span>
          </div>
          <p className="mt-2 text-muted">Dang tai san pham...</p>
        </div>
      )}
    </>
  );
}
