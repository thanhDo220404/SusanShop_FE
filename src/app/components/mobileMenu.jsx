"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MobileMenu({ open, onClose, user, logout }) {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await api.categories.getAll();
        const tree = buildTree(data.filter((c) => c.status));
        setCategories(tree);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCats();
  }, []);

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

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className={`mobile-menu-panel ${open ? "open" : ""}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link href="/" className="header-logo" onClick={onClose}>
          Susan
        </Link>
        <button
          className="header-icon-btn"
          onClick={onClose}
          style={{ width: 36, height: 36 }}
        >
          <i className="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <div className="mb-4">
        <Link
          href="/san-pham"
          onClick={onClose}
          className="d-flex align-items-center gap-2"
          style={{
            padding: "12px 0",
            fontWeight: 700,
            color: "#0d6efd",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span className="badge bg-danger" style={{ fontSize: "0.6rem" }}>
            HOT
          </span>
          Sản phẩm mới
        </Link>

        {categories.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isExpanded = expanded === cat._id;
          return (
            <div key={cat._id}>
              <div style={{ borderBottom: "1px solid #f0f0f0" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    onClick={onClose}
                    style={{ padding: "12px 0", fontWeight: 600, flex: 1 }}
                  >
                    {cat.name}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(cat._id)}
                      style={{
                        padding: "8px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        transition: "transform 0.3s ease",
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <i
                        className="bi bi-chevron-down"
                        style={{ fontSize: "0.8rem" }}
                      ></i>
                    </button>
                  )}
                </div>
              </div>

              {hasChildren && isExpanded && (
                <div className="mobile-sub">
                  {cat.children.map((child) => (
                    <div key={child._id}>
                      <Link
                        href={`/danh-muc/${child.slug}`}
                        onClick={onClose}
                        style={{ padding: "10px 0", fontWeight: 500 }}
                      >
                        {child.name}
                      </Link>
                      {child.children && child.children.length > 0 && (
                        <div style={{ paddingLeft: 12 }}>
                          {child.children.map((gc) => (
                            <Link
                              key={gc._id}
                              href={`/danh-muc/${gc.slug}`}
                              onClick={onClose}
                              className="mobile-sub"
                              style={{ padding: "6px 0" }}
                            >
                              {gc.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr />

      <div className="mt-3">
        {user ? (
          <>
            <div className="fw-bold">{user.name}</div>
            <div className="text-muted small mb-3">{user.email}</div>
            <Link
              href="/tai-khoan"
              onClick={onClose}
              className="d-block py-2 text-muted"
            >
              <i className="bi bi-gear me-2"></i>Tài khoản
            </Link>
            <button
              className="btn btn-dark mt-3"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              href="/dang-nhap"
              className="btn btn-dark text-light mb-2"
              onClick={onClose}
            >
              Đăng nhập
            </Link>
            <Link
              href="/dang-ky"
              className="btn btn-outline-dark"
              onClick={onClose}
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
