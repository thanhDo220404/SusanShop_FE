"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, categories, users, colors, media, reviews] =
          await Promise.all([
            api.products.getAll(),
            api.categories.getAll(),
            api.users.getAll(),
            api.colors.getAll(),
            api.media.getAll(),
            api.reviews.getAll(),
          ]);
        setStats({
          products: products.length,
          categories: categories.length,
          users: users.length,
          colors: colors.length,
          media: media.length,
          reviews: reviews.length,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Products", value: stats?.products, icon: "bi-box", color: "primary" },
    { label: "Categories", value: stats?.categories, icon: "bi-grid", color: "success" },
    { label: "Users", value: stats?.users, icon: "bi-people", color: "info" },
    { label: "Colors", value: stats?.colors, icon: "bi-palette", color: "secondary" },
    { label: "Media", value: stats?.media, icon: "bi-images", color: "danger" },
    { label: "Reviews", value: stats?.reviews, icon: "bi-star-fill", color: "warning" },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Failed to load data: {error}
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-3">
        {cards.map((card) => (
          <div className="col-md-4 col-lg-3" key={card.label}>
            <div className={`card border-${card.color} shadow-sm`}>
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className={`bg-${card.color} bg-opacity-10 rounded-3 p-3`}
                >
                  <i
                    className={`bi ${card.icon} text-${card.color} fs-3`}
                  ></i>
                </div>
                <div>
                  <div className="text-muted small">{card.label}</div>
                  <div className="fs-4 fw-bold">{card.value ?? "-"}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
