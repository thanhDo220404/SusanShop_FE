"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";
import Navbar from "./navbar";
import MobileMenu from "./mobileMenu";
import SearchBar from "./searchBar";

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className="header container-fluid px-0"
        style={{
          boxShadow: scrolled
            ? "0 4px 20px rgba(0,0,0,0.06)"
            : "0 1px 0 rgba(0,0,0,0.04)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div className="container-fluid px-lg-5">
          <div className="d-flex gap-3 gap-lg-4 position-relative py-2 justify-content-between align-items-center">
            <Link href="/" className="header-logo">
              Susan
            </Link>

            <Navbar />

            <div className="d-flex flex-grow-1 justify-content-center" style={{ maxWidth: 360 }}>
              <SearchBar />
            </div>

            <div className="d-flex gap-1 gap-lg-2 align-items-center">
              <div
                className="d-none d-lg-block position-relative"
                onMouseEnter={() => {
                  if (userTimer.current) clearTimeout(userTimer.current);
                  setUserOpen(true);
                }}
                onMouseLeave={() => {
                  userTimer.current = setTimeout(() => setUserOpen(false), 300);
                }}
              >
                <button className="header-icon-btn">
                  <i className="bi bi-person-fill fs-5"></i>
                </button>

                {userOpen && (
                  <div
                    className="user-dropdown"
                    onMouseEnter={() => {
                      if (userTimer.current) clearTimeout(userTimer.current);
                    }}
                    onMouseLeave={() => setUserOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email mb-3">{user.email}</div>
                        <hr className="my-3" />
                        <Link
                          href="/tai-khoan"
                          className="d-block text-muted small py-1 mb-3"
                          onClick={() => setUserOpen(false)}
                        >
                          <i className="bi bi-gear me-2"></i>Tài khoản
                        </Link>
                        <button
                          className="btn btn-dark"
                          onClick={() => {
                            logout();
                            setUserOpen(false);
                          }}
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="fw-bold mb-1">Tài khoản</div>
                        <div className="text-muted small mb-3">
                          Đăng nhập để nhận ưu đãi
                        </div>
                        <Link
                          href="/dang-nhap"
                          className="btn btn-dark text-light mb-2"
                          onClick={() => setUserOpen(false)}
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          href="/dang-ky"
                          className="btn btn-outline-dark"
                          onClick={() => setUserOpen(false)}
                        >
                          Đăng ký
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/gio-hang"
                className="header-icon-btn position-relative"
              >
                <i className="bi bi-bag fs-5"></i>
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>

              <button
                className={`hamburger-btn ${mobileOpen ? "open" : ""}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        logout={logout}
      />
    </>
  );
}
