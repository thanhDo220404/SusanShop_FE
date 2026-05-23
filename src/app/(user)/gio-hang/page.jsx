/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/cart";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "đ" : "";
}

function QuantityControl({ itemKey, quantity, stock, updateQuantity }) {
  const [inputValue, setInputValue] = useState(String(quantity));
  const [localQuantity, setLocalQuantity] = useState(quantity);

  if (localQuantity !== quantity) {
    setLocalQuantity(quantity);
    setInputValue(String(quantity));
  }

  const applyQuantity = (val) => {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > stock) num = stock;
    updateQuantity(itemKey, num);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setInputValue("");
      return;
    }
    let num = parseInt(raw, 10);
    if (num > stock) num = stock;
    setInputValue(String(num));
  };

  const handleBlur = () => {
    if (inputValue === "" || parseInt(inputValue, 10) < 1) {
      setInputValue("1");
      updateQuantity(itemKey, 1);
      return;
    }
    applyQuantity(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const lowStock = stock > 0 && stock <= 5;

  return (
    <div>
      <div className="d-flex align-items-center gap-1">
        <div
          className="d-flex align-items-center border rounded-pill overflow-hidden"
          style={{ minWidth: 110 }}
        >
          <button
            className="btn btn-sm border-0 rounded-0"
            style={{ padding: "4px 8px" }}
            onClick={() => applyQuantity(localQuantity - 1)}
            disabled={localQuantity <= 1}
          >
            <i className="bi bi-dash"></i>
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="form-control-plaintext text-center fw-bold small border-0 px-0"
            style={{
              width: 44,
              outline: "none",
              boxShadow: "none",
              background: "transparent",
            }}
          />
          <button
            className="btn btn-sm border-0 rounded-0"
            style={{ padding: "4px 8px" }}
            onClick={() => applyQuantity(localQuantity + 1)}
            disabled={localQuantity >= stock}
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </div>
      {lowStock && (
        <small className="text-warning mt-1 d-block">
          <i className="bi bi-exclamation-triangle me-1"></i>Chỉ còn {stock} sp
        </small>
      )}
      {stock === 0 && (
        <small className="text-danger mt-1 d-block">
          <i className="bi bi-x-circle me-1"></i>Hết hàng
        </small>
      )}
    </div>
  );
}

export default function CartPage() {
  const {
    items,
    loading,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Đang tải...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x display-3 text-muted"></i>
        <h3 className="mt-3 fw-bold">Giỏ hàng trống</h3>
        <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng của bạn.</p>
        <Link href="/san-pham" className="btn btn-dark rounded-pill px-4 py-2">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          Giỏ hàng{" "}
          <span className="text-muted fs-6 fw-normal">
            ({totalItems} sản phẩm)
          </span>
        </h2>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill mt-2 mt-md-0"
          onClick={() => {
            if (window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) {
              clearCart();
            }
          }}
        >
          <i className="bi bi-trash me-1"></i>Xóa tất cả
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {items.map((item) => {
            const variant = item.variant;
            const product = variant?.product_id;
            const color = variant?.color_id;
            const size = variant?.size_id;
            const price = variant?.price || 0;
            const discount = variant?.discount || 0;
            const salePrice = price * (1 - discount / 100);
            const imageUrl =
              product?.images?.[0]?.url ||
              product?.images?.[0]?.secure_url ||
              "https://res.cloudinary.com/duhmqsywm/image/upload/v1779262540/3694bd21-b0bd-4e47-83ed-58825dfe3771.png";
            const key = item._id || item.product_variant_id;
            const stock = variant?.stock || 0;

            return (
              <div
                key={key}
                className="card mb-3 border-0 shadow-sm rounded-4 overflow-hidden"
              >
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex gap-3">
                    <Link
                      href={`/san-pham/${product?.slug || ""}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={imageUrl}
                        alt={product?.name || ""}
                        className="rounded-3"
                        style={{ width: 90, height: 110, objectFit: "cover" }}
                      />
                    </Link>

                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Link
                            href={`/san-pham/${product?.slug || ""}`}
                            className="text-decoration-none text-dark"
                          >
                            <h6
                              className="mb-1 fw-bold"
                              style={{ fontSize: "0.95rem" }}
                            >
                              {product?.name || "Sản phẩm"}
                            </h6>
                          </Link>
                          {(color || size) && (
                            <div className="text-muted small mb-2">
                              {color && (
                                <span className="me-2">Màu: {color.name}</span>
                              )}
                              {size && <span>Size: {size.name}</span>}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-sm text-danger border-0 p-0 flex-shrink-0 ms-2"
                          onClick={() => removeItem(key)}
                          title="Xóa"
                          style={{ fontSize: "1.1rem" }}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>

                      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="fw-bold text-danger"
                            style={{ fontSize: "1rem" }}
                          >
                            {formatPrice(salePrice)}
                          </span>
                          {discount > 0 && (
                            <>
                              <span
                                className="badge bg-danger rounded-pill"
                                style={{ fontSize: "0.7rem" }}
                              >
                                -{discount}%
                              </span>
                              <span
                                className="text-decoration-line-through text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {formatPrice(price)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <QuantityControl
                            itemKey={key}
                            quantity={item.quantity}
                            stock={stock}
                            updateQuantity={updateQuantity}
                          />
                          <span
                            className="fw-bold"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {formatPrice(salePrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/san-pham"
            className="text-decoration-none d-inline-flex align-items-center gap-1 mt-2"
          >
            <i className="bi bi-arrow-left"></i>Tiếp tục mua sắm
          </Link>
        </div>

        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 sticky-top"
            style={{ top: 80, zIndex: 1 }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Tạm tính</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính</span>
                <span className="fw-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phí vận chuyển</span>
                <span className="text-success fw-semibold">Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold fs-5">Tổng cộng</span>
                <span className="fw-bold fs-5 text-danger">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <button
                className="btn btn-dark rounded-pill w-100 py-2 fw-semibold"
                disabled
              >
                Thanh toán (Sắp ra mắt)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
