/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import StatusTimeline from "@/app/components/StatusTimeline";
import ConfirmModal from "@/app/components/ConfirmModal";
import toast from "react-hot-toast";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", color: "#f59e0b" },
  confirmed: { label: "Đã xác nhận", color: "#3b82f6" },
  shipping: { label: "Đang giao", color: "#8b5cf6" },
  delivered: { label: "Đã giao", color: "#10b981" },
  cancelled: { label: "Đã hủy", color: "#ef4444" },
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const [orderData, itemsData, reviewsData] = await Promise.all([
          api.orders.getById(id),
          api.orderItems.getByOrderId(id),
          api.reviews.getByOrderId(id),
        ]);
        setOrder(orderData);
        setItems(itemsData);
        setReviews(reviewsData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    if (id) fetch();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setPendingStatus(null);
    setSaving(true);
    try {
      await api.orders.updateStatus(id, newStatus);
      const [orderData, itemsData] = await Promise.all([
        api.orders.getById(id),
        api.orderItems.getByOrderId(id),
      ]);
      setOrder(orderData);
      setItems(itemsData);
      toast.success(`Đã chuyển sang "${STATUS_MAP[newStatus]?.label || newStatus}"`);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  const VALID_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping"],
    shipping: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const allowedTransitions = VALID_TRANSITIONS[order?.status] || [];

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  if (!order)
    return <div className="text-center py-5 text-muted">Không tìm thấy đơn hàng</div>;

  const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const total = items.reduce(
    (sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemDiscount = subtotal - items.reduce((sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0);

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => router.back()}>
          <i className="bi bi-arrow-left me-1"></i>Quay lại
        </button>
        <h4 className="fw-bold mb-0">Chi tiết đơn hàng #{order._id?.slice(-6)}</h4>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="row align-items-start g-4">
            <div className="col-lg-8">
              <h6 className="fw-bold mb-3">Trạng thái đơn hàng</h6>
              <StatusTimeline currentStatus={order.status} history={order.status_history} />
            </div>
            <div className="col-lg-4">
              <div className="rounded-3 p-3" style={{ background: "#f9fafb" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge rounded-pill" style={{ background: s.color, color: "#fff", fontSize: "0.8rem" }}>{s.label}</span>
                </div>
                <div className="small text-muted mb-3">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </div>
                <label className="form-label small fw-semibold">Cập nhật trạng thái</label>
                {allowedTransitions.length > 0 ? (
                  <select
                    className="form-select form-select-sm rounded-3"
                    value=""
                    onChange={(e) => { if (e.target.value) setPendingStatus(e.target.value); }}
                    disabled={saving}
                  >
                    <option value="">Chọn trạng thái...</option>
                    {allowedTransitions.map((val) => (
                      <option key={val} value={val}>{STATUS_MAP[val]?.label || val}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-muted small">Không thể thay đổi</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Sản phẩm</h6>
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
                    {items.map((item) => {
                      const salePrice = item.price * (1 - (item.discount || 0) / 100);
                      const review = reviews.find((r) => String(r.order_item_id) === String(item._id));
                      return (
                        <tr key={item._id}>
                          <td>
                            {item.image_url ? (
                              <img src={item.image_url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                            ) : "-"}
                          </td>
                          <td className="fw-semibold small">{item.product_name}</td>
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
                                {[1,2,3,4,5].map((star) => (
                                  <i key={star} className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                                    style={{ color: star <= review.rating ? "#ffc107" : "#e5e7eb", fontSize: "0.55rem" }} />
                                ))}
                              </div>
                            ) : <span className="text-muted" style={{ fontSize: "0.7rem" }}>-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>Tạm tính</div>
                    {itemDiscount > 0 && <div className="text-success" style={{ fontSize: "0.8rem" }}>Giảm giá SP</div>}
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>Phí vận chuyển</div>
                    {order.coupon_discount > 0 && <div className="text-success" style={{ fontSize: "0.8rem" }}>Mã giảm ({order.coupon_code})</div>}
                    <div className="fw-bold mt-1" style={{ fontSize: "0.9rem" }}>Tổng</div>
                  </div>
                  <div className="col-md-6 text-end">
                    <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>{formatPrice(subtotal)}</div>
                    {itemDiscount > 0 && <div className="fw-semibold text-success" style={{ fontSize: "0.8rem" }}>-{formatPrice(itemDiscount)}</div>}
                    <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>
                      {order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : <span className="text-success">Miễn phí</span>}
                    </div>
                    {order.coupon_discount > 0 && <div className="fw-semibold text-success" style={{ fontSize: "0.8rem" }}>-{formatPrice(order.coupon_discount)}</div>}
                    <div className="fw-bold text-danger mt-1" style={{ fontSize: "1.1rem" }}>{formatPrice(order.total)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="d-flex flex-column gap-3">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <h6 className="fw-bold mb-2 small"><i className="bi bi-person me-1"></i>Khách hàng</h6>
                <div className="fw-semibold small">{order.user_id?.name || "?"}</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{order.user_id?.email || "-"}</div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <h6 className="fw-bold mb-2 small"><i className="bi bi-truck me-1"></i>Giao hàng</h6>
                <div className="fw-semibold small">{order.shipping_name}</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{order.shipping_phone}</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{order.shipping_address}</div>
                {order.notes && (
                  <div className="mt-1 small fst-italic" style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    <i className="bi bi-chat-left-text me-1"></i>{order.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <h6 className="fw-bold mb-2 small"><i className="bi bi-info-circle me-1"></i>Thông tin</h6>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  <div>Mã ĐH: #{order._id?.slice(-6)}</div>
                  <div>Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</div>
                  <div>Cập nhật: {new Date(order.updatedAt).toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-star-fill text-warning me-2"></i>Đánh giá ({reviews.length})
            </h6>
            <div className="row g-3">
              {reviews.map((review) => {
                const item = items.find((i) => String(i._id) === String(review.order_item_id));
                return (
                  <div key={review._id} className="col-md-4">
                    <div className="rounded-3 p-3 h-100" style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{ width: 28, height: 28, fontSize: "0.65rem",
                            background: `linear-gradient(135deg, ${["#6366f1","#8b5cf6","#ec4899","#f43f5e","#14b8a6","#f59e0b"][(review.user_id?.name || "U").charCodeAt(0) % 6]}, ${["#4f46e5","#7c3aed","#db2777","#e11d48","#0d9488","#d97706"][(review.user_id?.name || "U").charCodeAt(0) % 6]})` }}>
                          {review.user_id?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="small fw-semibold">{review.user_id?.name || "?"}</div>
                      </div>
                      <div className="small fw-semibold text-truncate mb-1">
                        {item?.product_name || review.product_variant_id?.product_id?.name || "?"}
                      </div>
                      <div className="small text-muted mb-1">
                        {[item?.color_name, item?.size_name].filter(Boolean).join(" / ") || "-"}
                      </div>
                      <div className="d-flex gap-0 mb-1">
                        {[1,2,3,4,5].map((star) => (
                          <i key={star} className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                            style={{ color: star <= review.rating ? "#ffc107" : "#e5e7eb", fontSize: "0.7rem" }} />
                        ))}
                      </div>
                      {review.content && (
                        <div className="small text-muted fst-italic" style={{ fontSize: "0.75rem" }}>
                          &ldquo;{review.content}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={!!pendingStatus}
        title="Xác nhận"
        message={`Chuyển trạng thái sang "${STATUS_MAP[pendingStatus]?.label || pendingStatus}"?`}
        onConfirm={() => handleStatusChange(pendingStatus)}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  );
}
