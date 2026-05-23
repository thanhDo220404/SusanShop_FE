"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function getChildren(cats, parentId) {
  return cats.filter((c) => {
    const pId = c.parent_category_id?._id || c.parent_category_id;
    return String(pId) === String(parentId);
  });
}

function buildTree(cats) {
  const roots = cats.filter((c) => !c.parent_category_id);
  return roots.map((root) => ({
    ...root,
    children: getChildren(cats, root._id).map((child) => ({
      ...child,
      children: getChildren(cats, child._id),
    })),
  }));
}

function CategoryColumn({ cat }) {
  const hasGrandchildren = cat.children && cat.children.length > 0;
  return (
    <div style={{ minWidth: 160 }}>
      <h6 className="text-uppercase fw-bold" style={{ fontSize: "0.8rem" }}>
        <Link href={`/danh-muc/${cat.slug}`} className="title">
          {cat.name} <i className="bi bi-arrow-right"></i>
        </Link>
      </h6>
      <ul className="p-0">
        <li>
          <Link href={`/danh-muc/${cat.slug}`} className="fw-semibold">
            Tất cả
          </Link>
        </li>
        {hasGrandchildren
          ? cat.children.map((grandChild) => (
              <li key={grandChild._id}>
                <Link href={`/danh-muc/${grandChild.slug}`}>
                  {grandChild.name}
                </Link>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}

export default function Navbar() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await api.categories.getAll();
        setCategories(data.filter((c) => c.status));
      } catch (err) {
        console.error(err);
      }
    }
    fetchCats();
  }, []);

  const tree = buildTree(categories);

  if (tree.length === 0) return null;

  return (
    <nav className="navbar py-0 d-none d-lg-block position-static flex-grow-1">
      <ul className="d-flex justify-content-center gap-1">
        <li>
          <Link href="/san-pham">
            <span className="badge bg-danger me-1" style={{ fontSize: "0.6rem", verticalAlign: "middle" }}>
              HOT
            </span>
            Mới về
          </Link>
        </li>

        {tree.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          if (hasChildren) {
            return (
              <li key={cat._id}>
                <Link href={`/danh-muc/${cat.slug}`}>
                  {cat.name}
                </Link>
                <div className="submenu">
                  <div className="d-flex gap-5 flex-wrap">
                    <div style={{ minWidth: 160 }}>
                      <h6 className="text-uppercase fw-bold" style={{ fontSize: "0.8rem" }}>
                        <Link href="/san-pham" className="title">
                          Khám phá <i className="bi bi-arrow-right"></i>
                        </Link>
                      </h6>
                      <ul className="p-0">
                        <li>
                          <Link
                            href="/san-pham"
                            className="fw-bold"
                            style={{ color: "#0d6efd" }}
                          >
                            Sản phẩm mới
                          </Link>
                        </li>
                        <li>
                          <Link href="/san-pham" className="fw-bold">
                            Bán chạy nhất
                          </Link>
                        </li>
                        <li>
                          <Link href="/san-pham" className="fw-bold">
                            Khuyến mãi
                          </Link>
                        </li>
                      </ul>
                    </div>
                    {cat.children.map((child) => (
                      <CategoryColumn key={child._id} cat={child} />
                    ))}
                  </div>
                </div>
              </li>
            );
          }
          return (
            <li key={cat._id}>
              <Link href={`/danh-muc/${cat.slug}`}>
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
