"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/app/components/productCard";
import { api } from "@/lib/api";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, prods, vars] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll(),
          api.variants.getAll(),
        ]);
        setAllCategories(cats);
        const foundCat = cats.find((c) => c.slug === slug);
        setCategory(foundCat);
        if (foundCat) {
          const childCats = cats.filter((c) => {
            const pId = c.parent_category_id?._id || c.parent_category_id;
            return String(pId) === String(foundCat._id);
          });
          setSubCategories(childCats);

          const collectDescendantIds = (parentId) => {
            const ids = [parentId];
            const children = cats.filter((c) => {
              const pId = c.parent_category_id?._id || c.parent_category_id;
              return String(pId) === String(parentId);
            });
            for (const child of children) {
              ids.push(...collectDescendantIds(child._id));
            }
            return ids;
          };

          const allCategoryIds = collectDescendantIds(foundCat._id);
          const catProds = prods
            .filter((p) => {
              const pCatId = p.category_id?._id || p.category_id;
              return allCategoryIds.includes(String(pCatId));
            })
            .map((p) => ({
              ...p,
              variants: vars.filter((v) => {
                const vProdId = v.product_id?._id || v.product_id;
                return String(vProdId) === String(p._id);
              }),
            }));
          setProducts(catProds);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price-asc") {
      return (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0);
    }
    if (sortBy === "price-desc") {
      return (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Dang tai...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container text-center py-5">
        <i className="bi bi-emoji-frown fs-1 text-muted"></i>
        <h2 className="mt-3">Khong tim thay danh muc</h2>
        <Link href="/san-pham" className="btn btn-primary mt-3">
          Xem tat ca san pham
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 my-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Trang chu</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/san-pham">San pham</Link>
          </li>
          <li className="breadcrumb-item active">{category.name}</li>
        </ol>
      </nav>

      <h2 className="fw-bold mb-1">{category.name}</h2>
      {category.description && (
        <p className="text-muted mb-3">{category.description}</p>
      )}

      {subCategories.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {subCategories.map((sub) => (
            <Link
              key={sub._id}
              href={`/danh-muc/${sub.slug}`}
              className="btn btn-outline-dark btn-sm rounded-pill"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <p className="text-muted">{sorted.length} san pham</p>

      <div className="d-flex gap-3 align-items-center mb-4">
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

      {sorted.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <p className="mt-2 text-muted">Chua co san pham trong danh muc nay</p>
        </div>
      ) : (
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {sorted.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
