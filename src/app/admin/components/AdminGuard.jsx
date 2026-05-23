/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = authApi.getUser();
    const token = authApi.getToken();
    if (!user || !token || user.role !== 1) {
      router.replace("/dang-nhap");
      return;
    }
    setAllowed(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Kiem tra quyen...</span>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return children;
}
