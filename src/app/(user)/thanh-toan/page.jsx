/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/contexts/cart";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import AddressModal from "@/app/components/AddressModal";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const { items, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadAddresses();
  }, [user]);

  async function loadAddresses() {
    try {
      const data = await api.userAddresses.getByUserId(user._id);
      setSavedAddresses(data);
      const def = data.find((a) => a.is_default);
      if (def) setSelectedAddressId(def._id);
      else if (data.length > 0) setSelectedAddressId(data[0]._id);
    } catch {}
  }

  function getFullAddress(addr) {
    return [addr.street, addr.ward, addr.district, addr.province]
      .filter(Boolean)
      .join(", ");
  }

  const selectedAddress = savedAddresses.find(
    (a) => a._id === selectedAddressId,
  );

  const selectedItems = items.filter((item) => {
    const key = item._id || item.product_variant_id;
    if (!selectedIds.includes(key)) return false;
    const v = item.variant;
    const p = v?.product_id;
    return v?.status !== false && p?.status !== false && (v?.stock || 0) > 0;
  });

  const total = selectedItems.reduce((sum, item) => {
    const price = item.variant?.price || 0;
    const discount = item.variant?.discount || 0;
    return sum + (price * (1 - discount / 100)) * (item.quantity || 0);
  }, 0);

  useEffect(() => {
    if (user && total > 0) {
      api.coupons.getAvailable(user._id, total).then(setAvailableCoupons).catch(() => {});
    }
  }, [user, total]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      router.push("/dang-nhap");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Không có sản phẩm nào");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ");
      return;
    }

    setSaving(true);
    try {
      const orderItems = selectedItems.map((item) => {
        const v = item.variant;
        const p = v?.product_id;
        const color = v?.color_id;
        const size = v?.size_id;
        const image = p?.images?.[0];
        return {
          product_variant_id: item.product_variant_id,
          product_name: p?.name || "",
          color_name: color?.name || "",
          size_name: size?.name || "",
          image_url: image?.url || image?.secure_url || "",
          price: v?.price || 0,
          discount: v?.discount || 0,
          quantity: item.quantity || 1,
        };
      });

      await api.orders.create({
        user_id: user._id,
        total: total - couponDiscount,
        coupon_code: couponDiscount > 0 ? couponCode : "",
        coupon_discount: couponDiscount,
        shipping_name: selectedAddress.name,
        shipping_phone: selectedAddress.phone,
        shipping_address: getFullAddress(selectedAddress),
        notes,
        items: orderItems,
      });

      await clearCart();
      toast.success("Đặt hàng thành công!");
      router.push("/");
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }

  if (cartLoading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Đang tải...</p>
      </div>
    );
  if (!user)
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-person-x display-3 text-muted"></i>
        <h3 className="mt-3 fw-bold">Vui lòng đăng nhập</h3>
        <p className="text-muted">Bạn cần đăng nhập để đặt hàng.</p>
        <Link href="/dang-nhap" className="btn btn-dark rounded-pill px-4">
          Đăng nhập
        </Link>
      </div>
    );
  if (selectedItems.length === 0)
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x display-3 text-muted"></i>
        <h3 className="mt-3 fw-bold">Không có sản phẩm</h3>
        <p className="text-muted">Vui lòng chọn sản phẩm trong giỏ hàng.</p>
        <Link href="/gio-hang" className="btn btn-dark rounded-pill px-4">
          Quay lại giỏ hàng
        </Link>
      </div>
    );

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Thanh toán</h2>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Địa chỉ giao hàng</h5>
                <button
                  className="btn btn-outline-dark btn-sm rounded-pill"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="bi bi-plus-lg me-1"></i>Thêm địa chỉ mới
                </button>
              </div>

              <div>
                {savedAddresses.length === 0 ? (
                  <p className="text-muted small mb-0">
                    Chưa có địa chỉ.{" "}
                    <button
                      className="btn btn-link btn-sm p-0"
                      onClick={() => setShowAddModal(true)}
                    >
                      Thêm mới
                    </button>
                  </p>
                ) : (
                  savedAddresses.map((addr) => {
                    const full = getFullAddress(addr);
                    const sel = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        className={`border rounded-3 p-3 mb-2 ${sel ? "border-primary bg-primary bg-opacity-10" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            className="form-check-input m-0"
                            checked={sel}
                            onChange={() => setSelectedAddressId(addr._id)}
                          />
                          <div>
                            <div className="fw-semibold small">
                              {addr.name} - {addr.phone}
                            </div>
                            <div className="text-muted small">{full}</div>
                          </div>
                          {addr.is_default && (
                            <span className="badge bg-primary rounded-pill ms-auto small">
                              Mặc định
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Mã giảm giá</h5>
              <div className="input-group input-group-sm mb-3">
                <input
                  className="form-control rounded-3"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                  placeholder="Nhập mã giảm giá"
                  disabled={couponDiscount > 0}
                />
                {couponDiscount > 0 ? (
                  <button className="btn btn-outline-danger rounded-3" onClick={() => { setCouponCode(""); setCouponDiscount(0); }}>
                    <i className="bi bi-x"></i>
                  </button>
                ) : (
                  <button className="btn btn-dark rounded-3" onClick={async () => {
                    if (!couponCode.trim()) return;
                    setApplyingCoupon(true);
                    try {
                      const res = await api.coupons.validate(couponCode, total);
                      setCouponDiscount(res.discount);
                      toast.success(`Giảm ${res.discount.toLocaleString("vi-VN")}đ`);
                    } catch (err) { setCouponError(err.message); }
                    finally { setApplyingCoupon(false); }
                  }} disabled={applyingCoupon}>
                    {applyingCoupon ? "..." : "Áp dụng"}
                  </button>
                )}
              </div>
              {couponError && <div className="text-danger small mb-2">{couponError}</div>}
              {couponDiscount > 0 && (
                <div className="text-success small mb-2">Đã giảm {couponDiscount.toLocaleString("vi-VN")}đ</div>
              )}

              {availableCoupons.length > 0 && couponDiscount === 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {availableCoupons.map((c) => (
                    <button
                      key={c._id}
                      className={`btn btn-sm rounded-pill ${c.valid ? "btn-outline-dark" : "btn-outline-secondary opacity-50"}`}
                      disabled={!c.valid}
                      onClick={() => {
                        setCouponCode(c.code);
                        setCouponDiscount(c.discount);
                        toast.success(`Giảm ${c.discount.toLocaleString("vi-VN")}đ`);
                      }}
                      title={c.reason || ""}
                    >
                      {c.code}
                      {c.valid && c.type === "percent" && <span className="ms-1 badge bg-danger rounded-pill" style={{ fontSize: "0.6rem" }}>-{c.value}%</span>}
                      {c.valid && c.type === "fixed" && <span className="ms-1 badge bg-danger rounded-pill" style={{ fontSize: "0.6rem" }}>-{c.value.toLocaleString("vi-VN")}đ</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Ghi chú</h5>
              <textarea
                className="form-control rounded-3"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về đơn hàng..."
              />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div
            className="card border-0 shadow-sm rounded-4 sticky-top"
            style={{ top: 80, zIndex: 1 }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                Đơn hàng ({selectedItems.length} sp)
              </h5>
              {selectedItems.map((item, idx) => {
                const v = item.variant;
                const p = v?.product_id;
                const price = v?.price || 0;
                const discount = v?.discount || 0;
                const salePrice = price * (1 - discount / 100);
                return (
                  <div
                    key={idx}
                    className="d-flex gap-2 mb-3 pb-3 border-bottom"
                  >
                    <img
                      src={
                        p?.images?.[0]?.url || p?.images?.[0]?.secure_url || ""
                      }
                      alt=""
                      className="rounded-2"
                      style={{ width: 50, height: 60, objectFit: "cover" }}
                    />
                    <div className="flex-grow-1 min-w-0">
                      <div className="small fw-semibold text-truncate">
                        {p?.name}
                      </div>
                      <div className="small text-muted">
                        {v?.color_id?.name && `Màu: ${v.color_id.name}`}
                        {v?.color_id?.name && v?.size_id?.name && " / "}
                        {v?.size_id?.name && `Size: ${v.size_id.name}`}
                      </div>
                      <div className="small">
                        x{item.quantity} - {formatPrice(salePrice)}
                      </div>
                    </div>
                    <div className="fw-semibold small">
                      {formatPrice(salePrice * item.quantity)}
                    </div>
                  </div>
                );
              })}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Tạm tính</span>
                <span>{formatPrice(total)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-success small">Giảm giá</span>
                  <span className="text-success">
                    -{formatPrice(couponDiscount)}
                  </span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Tổng cộng</span>
                <span className="fw-bold fs-5 text-danger">
                  {formatPrice(total - couponDiscount)}
                </span>
              </div>
              <button
                className="btn btn-dark rounded-pill w-100 py-2 fw-semibold"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Đang đặt hàng..."
                  : `Đặt hàng (${formatPrice(total - couponDiscount)})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        show={showAddModal}
        userId={user?._id}
        onClose={() => setShowAddModal(false)}
        onCreated={(newAddr) => {
          setSavedAddresses((prev) => [...prev, newAddr]);
          setSelectedAddressId(newAddr._id);
        }}
      />
    </div>
  );
}
