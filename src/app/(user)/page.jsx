"use client";
import { useEffect } from "react";
import Banner from "../components/banner";
import ProductCard from "../components/productCard";
import ProductSlider from "../components/productSliders";

export default function Example() {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <>
      <Banner />
      {
        <div className="container-fluid px-lg-5 my-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0">Sản phẩm nổi bật</h2>

            <a href="" className="text-decoration-none text-dark fw-semibold">
              Xem thêm →
            </a>
          </div>

          {/* Product List */}
          <div className="d-flex flex-wrap gap-4 justify-content-center">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCard key={i} />
            ))}
          </div>
        </div>
      }
      <ProductSlider
        title="Sản phẩm nổi bật"
        link="/products"
        products={Array.from({ length: 8 })}
        renderItem={(item) => <ProductCard product={item} />}
      />
    </>
  );
}
