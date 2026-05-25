"use client";
import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/app/components/productCard";
import { api } from "@/lib/api";
import { expandProductsByColor } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const availableColors = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      for (const v of p.variants || []) {
        if (!v.color_id) continue;
        const id = v.color_id?._id || v.color_id;
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: v.color_id?.name,
            hex: v.color_id?.hex,
          });
        }
      }
    }
    return [...map.values()];
  }, [products]);

  const availableSizes = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      for (const v of p.variants || []) {
        if (!v.size_id) continue;
        const id = v.size_id?._id || v.size_id;
        if (!map.has(id)) {
          map.set(id, { id, name: v.size_id?.name || id });
        }
      }
    }
    return [...map.values()];
  }, [products]);

  function getBestVariant(product) {
    const vars = product.variants || [];
    if (!vars.length) return null;
    let best = vars[0];
    let bestPrice = best.price * (1 - (best.discount || 0) / 100);
    for (const v of vars) {
      const p = v.price * (1 - (v.discount || 0) / 100);
      if (p < bestPrice) {
        best = v;
        bestPrice = p;
      }
    }
    return best;
  }

  let filtered = [...products];

  if (selectedCat) {
    filtered = filtered.filter((p) => {
      const catId = p.category_id?._id || p.category_id;
      return catId === selectedCat;
    });
  }

  if (searchText.trim()) {
    const kw = searchText.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        (p.slug && p.slug.toLowerCase().includes(kw)),
    );
  }

  if (selectedColor) {
    filtered = filtered.filter((p) =>
      (p.variants || []).some((v) => {
        const cid = v.color_id?._id || v.color_id;
        return String(cid) === String(selectedColor);
      }),
    );
  }

  if (selectedSize) {
    filtered = filtered.filter((p) =>
      (p.variants || []).some((v) => {
        const sid = v.size_id?._id || v.size_id;
        return String(sid) === String(selectedSize);
      }),
    );
  }

  if (saleOnly) {
    filtered = filtered.filter((p) =>
      (p.variants || []).some((v) => (v.discount || 0) > 0),
    );
  }

  if (inStockOnly) {
    filtered = filtered.filter((p) =>
      (p.variants || []).some((v) => (v.stock || 0) > 0),
    );
  }

  if (priceMin !== "" || priceMax !== "") {
    filtered = filtered.filter((p) => {
      const v = getBestVariant(p);
      if (!v) return false;
      const price = v.price * (1 - (v.discount || 0) / 100);
      if (priceMin !== "" && price < Number(priceMin)) return false;
      if (priceMax !== "" && price > Number(priceMax)) return false;
      return true;
    });
  }

  const getEffectivePrice = (p) => {
    const v = p.variants?.[0];
    return v ? v.price * (1 - (v.discount || 0) / 100) : 0;
  };

  const displayProducts = expandProductsByColor(filtered);

  if (sortBy === "price-asc") {
    displayProducts.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
  } else if (sortBy === "price-desc") {
    displayProducts.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
  } else {
    displayProducts.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }

  const hasActiveFilters =
    selectedColor || selectedSize || saleOnly || inStockOnly || priceMin !== "" || priceMax !== "";

  function clearFilters() {
    setPriceMin("");
    setPriceMax("");
    setSelectedColor("");
    setSelectedSize("");
    setSaleOnly(false);
    setInStockOnly(false);
  }

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
              onChange={(e) => setSearchText(e.target.value)}
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

          <button
            className={`btn ${showFilters ? "btn-dark" : "btn-outline-dark"} rounded-pill px-3`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-sliders me-1"></i>Bo loc
            {hasActiveFilters && (
              <span className="badge bg-danger ms-1 rounded-pill" style={{ fontSize: "0.6rem" }}>
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              className="btn btn-sm text-danger text-decoration-underline"
              onClick={clearFilters}
            >
              Xoa bo loc
            </button>
          )}
        </div>

        {showFilters && (
          <div className="border rounded-4 p-3 mb-3 bg-light bg-opacity-10">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-muted">Khoang gia</label>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="number"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="Tu"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    min={0}
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="Den"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold text-muted">Mau sac</label>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`color-btn ${selectedColor === "" ? "color-btn-active" : ""}`}
                    style={{ backgroundColor: "#6c757d" }}
                    title="Tat ca"
                    onClick={() => setSelectedColor("")}
                  />
                  {availableColors.map((c) => (
                    <button
                      key={c.id}
                      className={`color-btn ${selectedColor === c.id ? "color-btn-active" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      onClick={() =>
                        setSelectedColor(selectedColor === c.id ? "" : c.id)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold text-muted">Size</label>
                <div className="d-flex flex-wrap gap-1">
                  {availableSizes.map((s) => (
                    <button
                      key={s.id}
                      className={`btn btn-sm rounded-pill ${
                        selectedSize === s.id
                          ? "btn-dark"
                          : "btn-outline-dark"
                      }`}
                      onClick={() =>
                        setSelectedSize(selectedSize === s.id ? "" : s.id)
                      }
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-semibold text-muted d-block">&nbsp;</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="saleOnly"
                    checked={saleOnly}
                    onChange={(e) => setSaleOnly(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="saleOnly">
                    Dang giam gia
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inStockOnly"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="inStockOnly">
                    Con hang
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
