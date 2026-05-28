"use client";
import { useAuth } from "@/contexts/auth";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Thông tin tài khoản</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Họ tên</label>
              <div className="form-control-plaintext fw-semibold">{user?.name || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Email</label>
              <div className="form-control-plaintext">{user?.email || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Số điện thoại</label>
              <div className="form-control-plaintext">{user?.phone || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-muted">Vai trò</label>
              <div className="form-control-plaintext">{user?.role === 1 ? "Admin" : "Khách hàng"}</div>
            </div>
          </div>
          <button className="btn btn-outline-danger rounded-pill mt-4" onClick={logout}>
            <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}
