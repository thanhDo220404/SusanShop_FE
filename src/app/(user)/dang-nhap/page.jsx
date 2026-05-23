"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";

export default function DangNhapPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", pass: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.pass);
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
          <h2 className="fw-bold text-center mb-4">Dang nhap</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
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
              <label className="form-label">Mat khau</label>
              <input
                type="password"
                className="form-control"
                value={form.pass}
                onChange={(e) => setForm({ ...form, pass: e.target.value })}
                placeholder="Nhap mat khau"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-dark w-100 rounded-pill py-2"
              disabled={loading}
            >
              {loading ? "Dang dang nhap..." : "Dang nhap"}
            </button>
          </form>

          <p className="text-center mt-3">
            Chua co tai khoan?{" "}
            <Link href="/dang-ky" className="text-primary">
              Dang ky ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
