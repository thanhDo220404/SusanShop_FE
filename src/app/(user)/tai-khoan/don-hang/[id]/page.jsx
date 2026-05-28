/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import StatusTimeline from "@/app/components/StatusTimeline";
import ReviewModal, { StarRating } from "@/app/components/ReviewModal";
import toast from "react-hot-toast";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

export default function UserOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const [orderData, itemsData, reviewsData] = await Promise.all([
          api.orders.getById(id),
          api.orderItems.getByOrderId(id),
          api.reviews.getByOrderId(id),
        ]);
        if (orderData.user_id?._id !== user?._id && orderData.user_id !== user?._id) {
          router.replace("/tai-khoan/don-hang");
          return;
        }
        setOrder(orderData);
        setItems(itemsData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id && user) fetch();
  }, [id, user, router]);

  async function handleCancel() {
    try {
      await api.orders.updateStatus(id, "cancelled");
      const orderData = await api.orders.getById(id);
      setOrder(orderData);
      toast.success("Đã hủy đơn hàng");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleModalClose() {
    setShowReviewModal(false);
    const updatedReviews = await api.reviews.getByOrderId(id);
    setReviews(updatedReviews);
  }

  function getReviewForItem(itemId) {
    return reviews.find((r) => String(r.order_item_id) === String(itemId));
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#6366f1" }} />
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-5">
        <i className="bi bi-emoji-frown display-3 text-muted d-block mb-3"></i>
        <div className="text-muted">Không tìm thấy đơn hàng</div>
      </div>
    );

  const total = items.reduce(
    (sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemDiscount = subtotal - items.reduce((sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0);
  const isDelivered = order.status === "delivered";
  const unreviewedCount = items.filter(
    (item) => !reviews.some((r) => String(r.order_item_id) === String(item._id)),
  ).length;

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-sm d-flex align-items-center gap-1 text-muted"
          style={{ background: "none", border: "none", fontSize: "0.8rem" }}
          onClick={() => router.push("/tai-khoan/don-hang")}
        >
          <i className="bi bi-arrow-left"></i>Quay lại
        </button>
        <h5 className="fw-bold mb-0" style={{ letterSpacing: "-0.3px" }}>
          Chi tiết đơn hàng <span className="text-muted fw-normal">#{order._id?.slice(-6)}</span>
        </h5>
      </div>

      <div className="card border-0 rounded-4 mb-4" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-truck fs-5" style={{ color: "#6366f1" }}></i>
            <h6 className="fw-bold mb-0">Trạng thái đơn hàng</h6>
          </div>
          <StatusTimeline currentStatus={order.status} history={order.status_history} />
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
            <span className="text-muted" style={{ fontSize: "0.8rem" }}>
              <i className="bi bi-clock me-1"></i>{new Date(order.createdAt).toLocaleString("vi-VN")}
            </span>
            <div className="d-flex gap-2">
              {isDelivered && unreviewedCount > 0 && (
                <button
                  className="btn btn-sm rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    border: "none",
                    boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
                  }}
                  onClick={() => setShowReviewModal(true)}
                >
                  <i className="bi bi-star-fill"></i>Đánh giá ({unreviewedCount})
                </button>
              )}
              {order.status === "pending" && (
                <button
                  className="btn btn-sm rounded-pill px-3"
                  style={{ border: "1px solid #fca5a5", color: "#dc2626", background: "#fef2f2" }}
                  onClick={handleCancel}
                >
                  <i className="bi bi-x-circle me-1"></i>Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 rounded-4 mb-4" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-geo-alt fs-5" style={{ color: "#6366f1" }}></i>
            <h6 className="fw-bold mb-0">Địa chỉ nhận hàng</h6>
          </div>
          <div className="rounded-3 p-3" style={{ background: "#f9fafb" }}>
            <div className="fw-semibold small">{order.shipping_name}</div>
            <div className="text-muted small mb-1">{order.shipping_phone}</div>
            <div className="text-muted small">{order.shipping_address}</div>
            {order.notes && (
              <div className="mt-2 pt-2 small fst-italic" style={{ borderTop: "1px solid #e5e7eb", color: "#6b7280" }}>
                <i className="bi bi-chat-left-text me-1"></i>{order.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 rounded-4" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-bag fs-5" style={{ color: "#6366f1" }}></i>
            <h6 className="fw-bold mb-0">Sản phẩm đã đặt</h6>
            <span className="badge rounded-pill ms-auto" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 500 }}>{items.length} sản phẩm</span>
          </div>

          {items.map((item) => {
            const salePrice = item.price * (1 - (item.discount || 0) / 100);
            const existingReview = getReviewForItem(item._id);
            return (
              <div key={item._id} className="py-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div className="d-flex gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="rounded-3" style={{ width: 72, height: 72, objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                  ) : (
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 72, height: 72, background: "#f9fafb" }}>
                      <i className="bi bi-image text-muted"></i>
                    </div>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>{item.product_name}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {[item.color_name, item.size_name].filter(Boolean).join(" / ") || "-"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>x{item.quantity}</div>
                    {existingReview && (
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <StarRating rating={existingReview.rating} readonly />
                        {existingReview.content && (
                          <small className="text-muted fst-italic" style={{ fontSize: "0.65rem" }}>
                            &ldquo;{existingReview.content.substring(0, 40)}{existingReview.content.length > 40 ? "..." : ""}&rdquo;
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-end flex-shrink-0" style={{ minWidth: 100 }}>
                    <div style={{ fontSize: "0.8rem" }}>
                      {item.discount > 0 && (
                        <span className="text-decoration-line-through me-2" style={{ color: "#9ca3af" }}>{formatPrice(item.price)}</span>
                      )}
                      <span className="fw-semibold" style={{ color: item.discount > 0 ? "#dc2626" : "#111827" }}>{formatPrice(salePrice)}</span>
                    </div>
                    <div className="fw-bold mt-1" style={{ fontSize: "0.8rem", color: "#dc2626" }}>{formatPrice(salePrice * item.quantity)}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Tạm tính</span>
              <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{formatPrice(subtotal)}</span>
            </div>
            {itemDiscount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: "0.85rem", color: "#059669" }}>Giảm giá sản phẩm</span>
                <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 600 }}>-{formatPrice(itemDiscount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Phí vận chuyển</span>
              <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                {order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : <span className="text-success fw-bold">Miễn phí</span>}
              </span>
            </div>
            {order.coupon_discount > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span style={{ fontSize: "0.85rem", color: "#059669" }}>
                  <i className="bi bi-ticket-perforated me-1"></i>Mã giảm ({order.coupon_code})
                </span>
                <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 600 }}>-{formatPrice(order.coupon_discount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
              <span className="fw-bold" style={{ fontSize: "1rem" }}>Tổng tiền</span>
              <span className="fw-bold" style={{ fontSize: "1.2rem", color: "#dc2626" }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        show={showReviewModal}
        onClose={handleModalClose}
        items={items}
        userId={user._id}
        existingReviews={reviews}
        onSubmit={(data) => api.reviews.create(data)}
      />
    </>
  );
}
