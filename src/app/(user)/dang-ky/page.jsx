"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";

export default function DangKyPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    pass: "",
    repass: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.pass.length < 6) {
      setError("Mat khau phai it nhat 6 ky tu");
      return;
    }
    if (form.pass !== form.repass) {
      setError("Mat khau nhap lai khong khop");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.pass, form.phone);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <h2 className="fw-bold text-center mb-4">Dang ky</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Ho ten</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyen Van A"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">So dien thoai</label>
              <input
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0901234567"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mat khau</label>
              <input
                type="password"
                className="form-control"
                value={form.pass}
                onChange={(e) => setForm({ ...form, pass: e.target.value })}
                placeholder="Toi thieu 6 ky tu"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nhap lai mat khau</label>
              <input
                type="password"
                className="form-control"
                value={form.repass}
                onChange={(e) => setForm({ ...form, repass: e.target.value })}
                placeholder="Nhap lai mat khau"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-dark w-100 rounded-pill py-2"
              disabled={loading}
            >
              {loading ? "Dang dang ky..." : "Dang ky"}
            </button>
          </form>

          <p className="text-center mt-3">
            Da co tai khoan?{" "}
            <Link href="/dang-nhap" className="text-primary">
              Dang nhap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
