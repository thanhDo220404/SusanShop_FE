"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/app/components/productCard";
import Pagination from "@/app/components/Pagination";
import { api } from "@/lib/api";
import { expandProductsByColor } from "@/lib/products";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        const [vars, cats] = await Promise.all([
          api.variants.getAll(),
          api.categories.getAll(),
        ]);

        const productMap = new Map();
        for (const v of vars) {
          const p = v.product_id;
          if (!p || !p.status) continue;
          if (v.status === false) continue;
          const pid = p._id || p;
          if (!productMap.has(pid)) {
            productMap.set(pid, { ...p, variants: [] });
          }
          productMap.get(pid).variants.push(v);
        }

        setProducts([...productMap.values()]);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  let filtered = [...products];

  if (selectedCat) {
    filtered = filtered.filter((p) => {
      const catId = p.category_id?._id || p.category_id;
      return String(catId) === String(selectedCat);
    });
  }

  if (searchText.trim()) {
    const kw = searchText.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        (p.name &&
          p.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .includes(
              kw
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D"),
            )) ||
        (p.slug && p.slug.toLowerCase().includes(kw)),
    );
  }

  filtered.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  const displayProducts = expandProductsByColor(filtered);

  const totalPages = Math.ceil(displayProducts.length / perPage);
  const paginatedProducts = displayProducts.slice((page - 1) * perPage, page * perPage);
  console.log(displayProducts);

  return (
    <>
      <div className="container-fluid px-lg-5 my-4">
        <h2 className="fw-bold mb-1">Tat ca san pham</h2>
        <p className="text-muted">{displayProducts.length} san pham</p>

        <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
          <div className="position-relative" style={{ minWidth: 200 }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control ps-5 rounded-pill"
              placeholder="Tim san pham..."
              value={searchText}
                  onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
              style={{ minWidth: 220 }}
            />
            {searchText && (
              <button
                className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-1 border-0 text-muted"
                onClick={() => setSearchText("")}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          <select
            className="form-select w-auto"
            value={selectedCat}
            onChange={(e) => { setSelectedCat(e.target.value); setPage(1); }}
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
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 text-muted">Dang tai...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted"></i>
            <p className="mt-2 text-muted">Khong co san pham nao</p>
          </div>
        ) : (
          <>
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
          </>
        )}
      </div>
    </>
  );
}
