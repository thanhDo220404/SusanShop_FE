"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCats() {
      try {
        const data = await api.categories.getAll();
        setCategories(data.filter((c) => c.status && !c.parent_category_id).slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    }
    fetchCats();
  }, []);

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
        color: "#bbb",
      }}
    >
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link
              href="/"
              className="d-inline-block mb-3 text-decoration-none"
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #fff, #aaa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Susan
            </Link>
            <p className="mb-3" style={{ lineHeight: 1.8, maxWidth: 340 }}>
              Cửa hàng thời trang cao cấp dành cho phái đẹp. Chúng tôi cam kết mang đến
              những sản phẩm chất lượng, xu hướng mới nhất với giá cả hợp lý.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a href="#" className="footer-social-icon">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="footer-social-icon">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="footer-social-icon">
                <i className="bi bi-tiktok"></i>
              </a>
              <a href="#" className="footer-social-icon">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4">
            <h6
              className="text-uppercase mb-3"
              style={{ color: "#fff", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 700 }}
            >
              Danh mục
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    className="footer-link"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/san-pham" className="footer-link">
                  Sản phẩm mới
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4">
            <h6
              className="text-uppercase mb-3"
              style={{ color: "#fff", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 700 }}
            >
              Hỗ trợ
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li>
                <Link href="/" className="footer-link">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Hướng dẫn đặt hàng
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4">
            <h6
              className="text-uppercase mb-3"
              style={{ color: "#fff", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 700 }}
            >
              Về Susan
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li>
                <Link href="/" className="footer-link">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link">
                  Hệ thống cửa hàng
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2">
            <h6
              className="text-uppercase mb-3"
              style={{ color: "#fff", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 700 }}
            >
              Liên hệ
            </h6>
            <div className="d-flex flex-column gap-2" style={{ fontSize: "0.88rem" }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone" style={{ color: "#0d6efd" }}></i>
                <span>1900 9999 88</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope" style={{ color: "#0d6efd" }}></i>
                <span>support@susan.vn</span>
              </div>
              <div className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt mt-1" style={{ color: "#0d6efd" }}></i>
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.08)", margin: "40px 0 24px" }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small style={{ color: "#666" }}>
            © 2026 Susan Shop. Tất cả quyền được bảo lưu.
          </small>
          <div className="d-flex gap-3">
            <span style={{ width: 40, height: 26, background: "#fff", borderRadius: 4, opacity: 0.3 }} />
            <span style={{ width: 40, height: 26, background: "#fff", borderRadius: 4, opacity: 0.3 }} />
            <span style={{ width: 40, height: 26, background: "#fff", borderRadius: 4, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
