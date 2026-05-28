/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Pagination from "@/app/components/Pagination";

const STATUS_COLORS = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#3b82f6", bg: "#eff6ff" },
  shipping: { label: "Đang giao", color: "#8b5cf6", bg: "#f5f3ff" },
  delivered: { label: "Đã giao", color: "#10b981", bg: "#ecfdf5" },
  cancelled: { label: "Đã hủy", color: "#6b7280", bg: "#f3f4f6" },
};

const FILTER_TABS = [
  { key: "all", label: "Tất cả", icon: "bi-list-ul" },
  { key: "pending", label: "Chờ xác nhận", icon: "bi-hourglass-split" },
  { key: "confirmed", label: "Đã xác nhận", icon: "bi-check-circle" },
  { key: "shipping", label: "Đang giao", icon: "bi-truck" },
  { key: "delivered", label: "Đã giao", icon: "bi-box-seam" },
  { key: "cancelled", label: "Đã hủy", icon: "bi-x-circle" },
];

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailReviews, setDetailReviews] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await api.orders.getAll({ page, limit: 20 });
        if (data.pagination) {
          setOrders(data.Orders);
          setTotalPages(data.pagination.totalPages);
        } else {
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page]);

  async function toggleExpand(orderId) {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    setDetailLoading(true);
    try {
      const [items, reviews] = await Promise.all([
        api.orderItems.getByOrderId(orderId),
        api.reviews.getByOrderId(orderId).catch(() => []),
      ]);
      setDetailItems(items);
      setDetailReviews(reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  const tabCounts = useMemo(() => {
    const counts = {};
    for (const t of FILTER_TABS) counts[t.key] = 0;
    for (const order of orders) {
      counts.all++;
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((order) => {
        const orderId = order._id?.slice(-6)?.toLowerCase() || "";
        const customerName = (order.user_id?.name || "").toLowerCase();
        const shippingName = (order.shipping_name || "").toLowerCase();
        const phone = (order.shipping_phone || "").toLowerCase();
        const address = (order.shipping_address || "").toLowerCase();
        return orderId.includes(q) || customerName.includes(q) || shippingName.includes(q) || phone.includes(q) || address.includes(q);
      });
    }
    return result;
  }, [orders, filter, search]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#6366f1" }} />
      </div>
    );
  }

  return (
    <>
      <h4 className="fw-bold mb-3">
        <i className="bi bi-cart-check me-2" style={{ color: "#6366f1" }}></i>Đơn hàng ({orders.length})
      </h4>

      <div className="pb-3 mb-3">
        <div className="d-flex gap-1 flex-wrap mb-2">
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
                  transition: "all 0.15s ease",
                }}
                onClick={() => setFilter(t.key)}
              >
                <i className={`bi ${t.icon}`} style={{ fontSize: "0.7rem" }}></i>
                {t.label}
                <span className="rounded-pill d-inline-flex align-items-center justify-content-center"
                  style={{ background: active ? "rgba(255,255,255,0.2)" : "#e5e7eb", color: active ? "white" : "#6b7280", fontSize: "0.6rem", fontWeight: 700, minWidth: 18, height: 18, padding: "0 5px" }}>
                  {tabCounts[t.key] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <div className="input-group input-group-sm" style={{ maxWidth: 360 }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input type="text" className="form-control border-start-0 rounded-end-pill ps-0"
              placeholder="Tìm mã ĐH, tên khách hàng, SĐT..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ boxShadow: "none" }} />
            {search && (
              <button className="btn btn-outline-secondary rounded-pill ms-2" onClick={() => setSearch("")}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Địa chỉ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th className="pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      {search.trim() || filter !== "all" ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng"}
                    </td>
                  </tr>
                )}
                {filteredOrders.map((order) => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={order._id}>
                      <td className="ps-4">
                        <Link href={`/admin/orders/${order._id}`} className="text-decoration-none">
                          <span className="fw-semibold small text-dark">#{order._id?.slice(-6)}</span>
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold small">{order.shipping_name}</div>
                        <div className="text-muted small">{order.shipping_phone}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          <i className="bi bi-person me-1"></i>{order.user_id?.name || "?"} - {order.user_id?.email || ""}
                        </div>
                      </td>
                      <td className="small" style={{ maxWidth: 200 }}>{order.shipping_address}</td>
                      <td className="fw-semibold small">{formatPrice(order.total)}</td>
                      <td>
                        <span className="badge rounded-pill" style={{ background: sc.bg, color: sc.color, fontSize: "0.7rem", fontWeight: 600 }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="pe-4">
                        <div className="d-flex gap-1">
                          <Link href={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-primary rounded-pill">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => toggleExpand(order._id)}>
                            <i className={`bi ${expandedId === order._id ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {expandedId && (
        <div className="card border-0 shadow-sm rounded-3 mt-3 mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">Chi tiết đơn hàng</h6>
            {detailLoading ? (
              <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: "#6366f1" }} /></div>
            ) : detailItems.length === 0 ? (
              <p className="text-muted small mb-0">Không có sản phẩm</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ảnh</th>
                      <th>Sản phẩm</th>
                      <th>Phân loại</th>
                      <th>Đơn giá</th>
                      <th>SL</th>
                      <th>Thành tiền</th>
                      <th>Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailItems.map((item) => {
                      const salePrice = item.price * (1 - (item.discount || 0) / 100);
                      const review = detailReviews.find((r) => String(r.order_item_id) === String(item._id));
                      return (
                        <tr key={item._id}>
                          <td>
                            {item.image_url ? (
                              <img src={item.image_url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="small fw-semibold">{item.product_name}</td>
                          <td className="small text-muted">
                            {[item.color_name, item.size_name].filter(Boolean).join(" / ") || "-"}
                          </td>
                          <td className="small">
                            {item.discount > 0 && <span className="text-decoration-line-through text-muted me-1">{formatPrice(item.price)}</span>}
                            {formatPrice(salePrice)}
                            {item.discount > 0 && <span className="text-danger ms-1">-{item.discount}%</span>}
                          </td>
                          <td className="small">x{item.quantity}</td>
                          <td className="small fw-semibold">{formatPrice(salePrice * item.quantity)}</td>
                          <td>
                            {review ? (
                              <div className="d-flex gap-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i key={star} className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                                    style={{ color: star <= review.rating ? "#ffc107" : "#e5e7eb", fontSize: "0.55rem" }} />
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontSize: "0.7rem" }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
