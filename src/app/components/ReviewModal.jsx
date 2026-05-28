/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

function StarRating({ rating, onRate, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${star <= (hover || rating) ? "bi-star-fill" : "bi-star"}`}
          style={{
            color: star <= (hover || rating) ? "#ffc107" : "#ccc",
            fontSize: readonly ? "0.85rem" : "1.3rem",
            cursor: readonly ? "default" : "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onRate(star)}
        />
      ))}
    </div>
  );
}

export { StarRating };

export default function ReviewModal({
  show,
  onClose,
  items,
  user_id,
  existingReviews,
  onSubmit,
}) {
  const [ratings, setRatings] = useState({});
  const [contents, setContents] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const unreviewed = items.filter(
    (item) =>
      !existingReviews.some(
        (r) => String(r.order_item_id) === String(item._id),
      ),
  );

  useEffect(() => {
    const init = {};
    const initContent = {};
    for (const item of unreviewed) {
      init[item._id] = 5;
      initContent[item._id] = "";
    }
    setRatings(init);
    setContents(initContent);
  }, [show]);

  function handleRating(itemId, val) {
    setRatings((prev) => ({ ...prev, [itemId]: val }));
  }

  function handleContent(itemId, val) {
    setContents((prev) => ({ ...prev, [itemId]: val }));
  }

  async function handleSubmitAll() {
    setSubmitting(true);
    let success = 0;
    let failed = 0;
    for (const item of unreviewed) {
      try {
        await onSubmit({
          user_id,
          product_variant_id:
            item.product_variant_id?._id || item.product_variant_id,
          order_item_id: item._id,
          rating: ratings[item._id] || 5,
          content: contents[item._id] || "",
        });

        success++;
      } catch {
        failed++;
      }
    }
    setSubmitting(false);
    if (failed === 0) {
      toast.success(`Đã gửi ${success} đánh giá`);
    } else {
      toast(`${success} thành công, ${failed} thất bại`, { icon: "⚠️" });
    }
    onClose();
  }

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header border-0 px-4 pt-4 pb-2">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-star-fill text-warning me-2"></i>Đánh giá
                đơn hàng
              </h5>
              <button
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
              />
            </div>
            <div className="modal-body px-4 py-3">
              {unreviewed.map((item) => (
                <div key={item._id} className="mb-4 pb-4 border-bottom">
                  <div className="d-flex gap-3 mb-2">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="rounded-3"
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-3 bg-light d-flex align-items-center justify-content-center"
                        style={{ width: 60, height: 60 }}
                      >
                        <i className="bi bi-image text-muted" />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">
                        {item.product_name}
                      </div>
                      <div className="text-muted small">
                        {[item.color_name, item.size_name]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </div>
                    </div>
                    <div className="fw-bold small text-danger">
                      {formatPrice(
                        item.price *
                          (1 - (item.discount || 0) / 100) *
                          item.quantity,
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <StarRating
                      rating={ratings[item._id] || 5}
                      onRate={(v) => handleRating(item._id, v)}
                    />
                  </div>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={contents[item._id] || ""}
                    onChange={(e) => handleContent(item._id, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer border-0 px-4 pb-4 pt-0">
              <button
                className="btn btn-outline-secondary rounded-pill"
                onClick={onClose}
                disabled={submitting}
              >
                Để sau
              </button>
              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={handleSubmitAll}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>Gửi tất cả đánh giá
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
