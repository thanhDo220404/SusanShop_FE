"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: "bi-speedometer2" },
  { label: "Products", href: "/admin/products", icon: "bi-box" },
  { label: "Categories", href: "/admin/categories", icon: "bi-grid" },
  { label: "Orders", href: "/admin/orders", icon: "bi-cart-check" },
  { label: "Reviews", href: "/admin/reviews", icon: "bi-star-fill" },
  { label: "Colors", href: "/admin/colors", icon: "bi-palette" },
  { label: "Coupons", href: "/admin/coupons", icon: "bi-ticket-perforated" },
  {
    label: "Size Categories",
    href: "/admin/size-categories",
    icon: "bi-rulers",
  },
  { label: "Size Options", href: "/admin/size-options", icon: "bi-fonts" },
  { label: "Users", href: "/admin/users", icon: "bi-people" },
  { label: "Media", href: "/admin/media", icon: "bi-images" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark position-fixed top-0 start-0 h-100 overflow-auto"
      style={{ width: 250 }}
    >
      <Link
        href="/admin"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
      >
        <span className="fs-4 fw-bold">Susan Admin</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li className="nav-item" key={item.href}>
              <Link
                href={item.href}
                className={`nav-link text-white d-flex align-items-center gap-2 ${isActive ? "active" : ""}`}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Link
        href="/"
        className="nav-link text-white-50 d-flex align-items-center gap-2"
      >
        <i className="bi bi-shop"></i> View Store
      </Link>
    </div>
  );
}
