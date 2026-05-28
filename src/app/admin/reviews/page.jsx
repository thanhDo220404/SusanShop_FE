"use client";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "@/app/admin/components/ConfirmModal";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleReview, setToggleReview] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const data = await api.reviews.getAll();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!ratingFilter) return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  async function handleToggleStatus() {
    const review = toggleReview;
    setToggleReview(null);
    try {
      await api.reviews.update(review._id, { status: !review.status });
      toast.success(review.status ? "Đã ẩn đánh giá" : "Đã hiện đánh giá");
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    const id = deleteReview;
    setDeleteReview(null);
    try {
      await api.reviews.delete(id);
      toast.success("Đã xóa đánh giá");
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#6366f1" }} />
      </div>
    );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-star-fill text-warning me-2"></i>Đánh giá ({reviews.length})
        </h4>
        <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={fetchReviews}>
          <i className="bi bi-arrow-clockwise me-1"></i>Làm mới
        </button>
      </div>

      <div className="d-flex gap-1 mb-3 flex-wrap">
        {[0, 5, 4, 3, 2, 1].map((star) => {
          const count = star === 0 ? reviews.length : reviews.filter((r) => r.rating === star).length;
          const active = ratingFilter === star;
          return (
            <button
              key={star}
              className="btn btn-sm rounded-pill d-flex align-items-center gap-1"
              style={{
                background: active ? "#f59e0b" : "#f3f4f6",
                color: active ? "white" : "#6b7280",
                fontWeight: active ? 600 : 400,
                fontSize: "0.75rem",
                border: "none",
                transition: "all 0.15s ease",
              }}
              onClick={() => setRatingFilter(star)}
            >
              {star === 0 ? (
                <>Tất cả</>
              ) : (
                <>{star} <i className="bi bi-star-fill" style={{ fontSize: "0.6rem" }}></i></>
              )}
              <span
                className="rounded-pill d-inline-flex align-items-center justify-content-center"
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#e5e7eb",
                  color: active ? "white" : "#6b7280",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Người dùng</th>
                  <th>Sản phẩm</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      Chưa có đánh giá nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((review) => (
                    <tr key={review._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: 32,
                              height: 32,
                              fontSize: "0.75rem",
                              background: `linear-gradient(135deg, ${["#6366f1","#8b5cf6","#ec4899","#f43f5e","#14b8a6","#f59e0b"][(review.user_id?.name || "U").charCodeAt(0) % 6]}, ${["#4f46e5","#7c3aed","#db2777","#e11d48","#0d9488","#d97706"][(review.user_id?.name || "U").charCodeAt(0) % 6]})`,
                            }}
                          >
                            {review.user_id?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="small fw-semibold">{review.user_id?.name || "Ẩn danh"}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small fw-semibold">
                          {review.product_variant_id?.product_id?.name || review.product_id?.name || "?"}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                              style={{ color: star <= review.rating ? "#ffc107" : "#e5e7eb", fontSize: "0.8rem" }}
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="small" style={{ maxWidth: 250, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {review.content || <span className="text-muted fst-italic">-</span>}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${review.status ? "bg-success" : "bg-secondary"}`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {review.status ? "Hiện" : "Ẩn"}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </small>
                      </td>
                      <td className="pe-4">
                        <div className="d-flex gap-1">
                          <button
                            className={`btn btn-sm rounded-pill ${review.status ? "btn-outline-secondary" : "btn-outline-success"}`}
                            onClick={() => setToggleReview(review)}
                            title={review.status ? "Ẩn" : "Hiện"}
                          >
                            <i className={`bi ${review.status ? "bi-eye-slash" : "bi-eye"}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => setDeleteReview(review._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={!!toggleReview}
        title="Xác nhận"
        message={toggleReview?.status ? "Ẩn đánh giá này?" : "Hiện đánh giá này?"}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleReview(null)}
      />

      <ConfirmModal
        show={!!deleteReview}
        title="Xóa đánh giá"
        message="Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onCancel={() => setDeleteReview(null)}
      />
    </>
  );
}
