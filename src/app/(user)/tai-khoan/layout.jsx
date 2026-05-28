"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth";

const tabs = [
  { key: "", label: "Tài khoản", icon: "bi-person", href: "/tai-khoan" },
  {
    key: "don-hang",
    label: "Đơn hàng",
    icon: "bi-receipt",
    href: "/tai-khoan/don-hang",
  },
  {
    key: "dia-chi",
    label: "Sổ địa chỉ",
    icon: "bi-geo-alt",
    href: "/tai-khoan/dia-chi",
  },
];

export default function AccountLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-person-x display-3 text-muted"></i>
        <h3 className="mt-3 fw-bold">Vui lòng đăng nhập</h3>
        <Link href="/dang-nhap" className="btn btn-dark rounded-pill px-4">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 py-4">
      <h2 className="fw-bold mb-4">Tài khoản của tôi</h2>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="d-flex flex-column gap-1">
            {tabs.map((t) => {
              const isActive =
                t.key === ""
                  ? pathname === "/tai-khoan"
                  : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  className={`d-flex align-items-center gap-2 rounded-3 px-3 py-2 text-decoration-none small fw-semibold ${isActive ? "bg-dark text-white" : "text-dark"}`}
                >
                  <i className={`bi ${t.icon}`}></i>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="col-md-9">{children}</div>
      </div>
    </div>
  );
}
