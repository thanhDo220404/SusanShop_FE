"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/app/components/productCard";
import { api } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prods, vars, cats] = await Promise.all([
          api.products.getAll(),
          api.variants.getAll(),
          api.categories.getAll(),
        ]);
        const enriched = prods.map((p) => ({
          ...p,
          variants: vars.filter((v) => {
            const vProdId = v.product_id?._id || v.product_id;
            return vProdId === p._id;
          }),
        }));
        setProducts(enriched);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  let filtered = selectedCat
    ? products.filter((p) => {
        const catId = p.category_id?._id || p.category_id;
        return catId === selectedCat;
      })
    : [...products];

  filtered.sort((a, b) => {
    if (sortBy === "price-asc") {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;
      return priceA - priceB;
    }
    if (sortBy === "price-desc") {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;
      return priceB - priceA;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <>
      <div className="container-fluid px-lg-5 my-4">
        <h2 className="fw-bold mb-1">Tat ca san pham</h2>
        <p className="text-muted">{filtered.length} san pham</p>

        <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
          <select
            className="form-select w-auto"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="">Tat ca danh muc</option>
            {categories
              .filter((c) => c.status)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>

          <select
            className="form-select w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Moi nhat</option>
            <option value="price-asc">Gia: Thap den Cao</option>
            <option value="price-desc">Gia: Cao den Thap</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Dang tai...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <p className="mt-2 text-muted">Khong co san pham nao</p>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-4 justify-content-center">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
