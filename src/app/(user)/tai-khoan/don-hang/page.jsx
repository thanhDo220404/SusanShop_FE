/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth";
import { useCart } from "@/contexts/cart";
import { api } from "@/lib/api";
import ReviewModal, { StarRating } from "@/app/components/ReviewModal";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

const STATUS_COLORS = {
  pending: { color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { color: "#3b82f6", bg: "#eff6ff" },
  shipping: { color: "#8b5cf6", bg: "#f5f3ff" },
  delivered: { color: "#10b981", bg: "#ecfdf5" },
  cancelled: { color: "#6b7280", bg: "#f3f4f6" },
};

const FILTER_TABS = [
  { key: "all", label: "Tất cả", icon: "bi-list-ul" },
  { key: "pending", label: "Chờ xác nhận", icon: "bi-hourglass-split" },
  { key: "confirmed", label: "Đã xác nhận", icon: "bi-check-circle" },
  { key: "shipping", label: "Đang giao", icon: "bi-truck" },
  { key: "delivered", label: "Đã giao", icon: "bi-box-seam" },
  { key: "cancelled", label: "Đã hủy", icon: "bi-x-circle" },
  { key: "unreviewed", label: "Chưa đánh giá", icon: "bi-star" },
  { key: "reviewed", label: "Đã đánh giá", icon: "bi-star-fill" },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [allReviews, setAllReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewsForModal, setReviewsForModal] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      try {
        const [ordersData, reviewsData] = await Promise.all([
          api.orders.getByUserId(user._id),
          api.reviews.getByUserId(user._id),
        ]);
        setOrders(ordersData);
        const map = {};
        for (const r of reviewsData) {
          const oiId = r.order_item_id?._id || r.order_item_id;
          map[String(oiId)] = r;
        }
        setAllReviews(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [user]);

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of FILTER_TABS) counts[t.key] = 0;
    for (const order of orders) {
      counts.all++;
      counts[order.status] = (counts[order.status] || 0) + 1;
      if (order.status === "delivered") {
        const items = order.items || [];
        const total = items.length;
        const reviewed = items.filter((item) => allReviews[String(item._id)]).length;
        if (reviewed === total && total > 0) counts.reviewed++;
        if (reviewed < total) counts.unreviewed++;
      }
    }
    return counts;
  }, [orders, allReviews]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter === "unreviewed") {
      result = orders.filter((order) => {
        if (order.status !== "delivered") return false;
        const items = order.items || [];
        return items.some((item) => !allReviews[String(item._id)]);
      });
    } else if (filter === "reviewed") {
      result = orders.filter((order) => {
        if (order.status !== "delivered") return false;
        const items = order.items || [];
        return items.length > 0 && items.every((item) => allReviews[String(item._id)]);
      });
    } else if (filter !== "all") {
      result = orders.filter((order) => order.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((order) => {
        if (order._id?.slice(-6)?.toLowerCase().includes(q)) return true;
        const items = order.items || [];
        return items.some((item) => (item.product_name || "").toLowerCase().includes(q));
      });
    }

    return result;
  }, [orders, filter, allReviews, search]);

  async function handleCancel(orderId) {
    try {
      await api.orders.updateStatus(orderId, "cancelled");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o)),
      );
      toast.success("Đã hủy đơn hàng");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleOpenReview(order) {
    setReviewOrder(order);
    setReviewsLoading(true);
    try {
      const r = await api.reviews.getByOrderId(order._id);
      setReviewsForModal(r);
    } catch {
      setReviewsForModal([]);
    }
    setReviewsLoading(false);
  }

  async function handleBuyAgain(order) {
    const items = order.items || [];
    let added = 0;
    for (const item of items) {
      try {
        const variantId = item.product_variant_id?._id || item.product_variant_id;
        await addToCart(variantId, item.quantity);
        added++;
      } catch { /* skip */ }
    }
    if (added > 0) toast.success(`Đã thêm ${added} sản phẩm vào giỏ hàng`);
  }

  async function handleReviewClose() {
    setReviewOrder(null);
    setReviewsForModal([]);
    const updated = await api.reviews.getByUserId(user._id);
    const map = {};
    for (const r of updated) {
      const oiId = r.order_item_id?._id || r.order_item_id;
      map[String(oiId)] = r;
    }
    setAllReviews(map);
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#6366f1" }} />
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center py-5">
        <i className="bi bi-inbox display-3 d-block mb-3" style={{ color: "#d1d5db" }}></i>
        <div className="text-muted mb-3">Chưa có đơn hàng nào</div>
        <Link href="/san-pham" className="btn btn-dark rounded-pill px-4">Mua sắm ngay</Link>
      </div>
    );

  return (
    <>
      <div className="pb-3 mb-3">
        <div className="d-flex gap-1 flex-wrap">
          {FILTER_TABS.map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.key}
                className="btn btn-sm rounded-pill d-flex align-items-center gap-1 border-0"
                style={{
                  background: active ? "#111827" : "#f3f4f6",
                  color: active ? "white" : "#6b7280",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.75rem",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setFilter(t.key)}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#e5e7eb"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "#f3f4f6"; }}
              >
                <i className={`bi ${t.icon}`} style={{ fontSize: "0.7rem" }}></i>
                {t.label}
                <span
                  className="rounded-pill d-inline-flex align-items-center justify-content-center"
                  style={{
                    background: active ? "rgba(255,255,255,0.2)" : "#e5e7eb",
                    color: active ? "white" : "#6b7280",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                  }}
                >
                  {tabCounts[t.key] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 rounded-end-pill ps-0"
              placeholder="Tìm mã ĐH hoặc tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ boxShadow: "none" }}
            />
            {search && (
              <button className="btn btn-outline-secondary rounded-pill ms-2" onClick={() => setSearch("")}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-folder2-open display-3 d-block mb-3" style={{ color: "#d1d5db" }}></i>
          <div className="text-muted">Không có đơn hàng nào</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredOrders.map((order) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const items = order.items || [];
            const unreviewedCount = items.filter((item) => !allReviews[String(item._id)]).length;
            const allReviewed = order.status === "delivered" && unreviewedCount === 0 && items.length > 0;
            return (
              <div key={order._id} className="rounded-4 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s ease" }}>
                <div className="p-3" style={{ background: "white" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="small fw-semibold">#{order._id?.slice(-6)}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {allReviewed && (
                        <span className="rounded-pill d-flex align-items-center gap-1 px-2 py-1" style={{ background: "#ecfdf5", color: "#059669", fontSize: "0.65rem", fontWeight: 600 }}>
                          <i className="bi bi-check2-all"></i>Đã đánh giá
                        </span>
                      )}
                      <span className="rounded-pill px-2 py-1" style={{ background: sc.bg, color: sc.color, fontSize: "0.65rem", fontWeight: 600 }}>
                        {order.status === "pending" ? "Chờ xác nhận" :
                         order.status === "confirmed" ? "Đã xác nhận" :
                         order.status === "shipping" ? "Đang giao" :
                         order.status === "delivered" ? "Đã giao" : "Đã hủy"}
                      </span>
                      {order.status === "pending" && (
                        <button
                          className="btn btn-sm rounded-pill px-2 py-1"
                          style={{ border: "1px solid #fca5a5", color: "#dc2626", background: "#fef2f2", fontSize: "0.65rem" }}
                          onClick={() => handleCancel(order._id)}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>

                  {items.map((item) => {
                    const salePrice = item.price * (1 - (item.discount || 0) / 100);
                    const review = allReviews[String(item._id)];
                    return (
                      <div key={item._id} className="d-flex gap-3 py-2" style={{ borderTop: "1px solid #f3f4f6" }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="rounded-2 flex-shrink-0" style={{ width: 48, height: 48, objectFit: "cover" }} />
                        ) : (
                          <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: "#f9fafb" }}>
                            <i className="bi bi-image text-muted" style={{ fontSize: "0.8rem" }}></i>
                          </div>
                        )}
                        <div className="flex-grow-1 min-w-0">
                          <div className="small fw-semibold text-truncate">{item.product_name}</div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                              {[item.color_name, item.size_name].filter(Boolean).join(" / ") || "-"}
                            </span>
                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>x{item.quantity}</span>
                          </div>
                          {review && (
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <StarRating rating={review.rating} readonly />
                              {review.content && (
                                <small className="text-muted fst-italic" style={{ fontSize: "0.65rem" }}>
                                  &ldquo;{review.content.substring(0, 40)}{review.content.length > 40 ? "..." : ""}&rdquo;
                                </small>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-end flex-shrink-0" style={{ minWidth: 80 }}>
                          <div className="small fw-bold" style={{ color: "#dc2626" }}>{formatPrice(salePrice * item.quantity)}</div>
                          <div style={{ fontSize: "0.7rem" }}>
                            {item.discount > 0 && <span className="text-decoration-line-through me-1" style={{ color: "#9ca3af" }}>{formatPrice(item.price)}</span>}
                            <span>{formatPrice(salePrice)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="d-flex align-items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid #f3f4f6" }}>
                    <div className="fw-bold small">{formatPrice(order.total)}</div>
                    <div className="flex-grow-1"></div>
                    <Link
                      href={`/tai-khoan/don-hang/${order._id}`}
                      className="btn btn-sm rounded-pill"
                      style={{ border: "1px solid #d1d5db", color: "#374151", fontSize: "0.7rem", fontWeight: 500 }}
                    >
                      Xem chi tiết<i className="bi bi-chevron-right ms-1"></i>
                    </Link>
                    {order.status === "delivered" && (
                      <button
                        className="btn btn-sm rounded-pill"
                        style={{ border: "1px solid #6366f1", color: "#6366f1", fontSize: "0.7rem", fontWeight: 500 }}
                        onClick={() => handleBuyAgain(order)}
                      >
                        <i className="bi bi-cart-plus me-1"></i>Mua lại
                      </button>
                    )}
                    {order.status === "delivered" && unreviewedCount > 0 && (
                      <button
                        className="btn btn-sm rounded-pill d-flex align-items-center gap-1"
                        style={{
                          background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          color: "white",
                          border: "none",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 10px rgba(245,158,11,0.25)",
                        }}
                        onClick={() => handleOpenReview(order)}
                      >
                        <i className="bi bi-star-fill"></i>Đánh giá ({unreviewedCount})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewOrder && !reviewsLoading && (
        <ReviewModal
          show
          onClose={handleReviewClose}
          items={reviewOrder.items || []}
          userId={user._id}
          existingReviews={reviewsForModal}
          onSubmit={(data) => api.reviews.create(data)}
        />
      )}
    </>
  );
}
