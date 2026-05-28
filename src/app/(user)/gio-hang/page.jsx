/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/cart";
import { api } from "@/lib/api";
import ConfirmModal from "@/app/components/ConfirmModal";

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
    if (e.key === "Enter") e.target.blur();
  };

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
      {stock > 0 && stock <= 5 && (
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
    updateQuantity,
    removeItem,
    clearCart,
    changeVariant,
  } = useCart();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [allVariants, setAllVariants] = useState([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  useEffect(() => {
    async function load() {
      setVariantLoading(true);
      try {
        const vars = await api.variants.getAll();
        setAllVariants(vars);
      } catch {
        /* ignore */
      } finally {
        setVariantLoading(false);
      }
    }
    load();
  }, []);

  const productVariantsMap = useMemo(() => {
    const map = new Map();
    for (const v of allVariants) {
      const p = v.product_id;
      if (!p) continue;
      const pid = p._id || p;
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid).push(v);
    }
    return map;
  }, [allVariants]);

  function getAvailableOptions(productId) {
    const variants = productVariantsMap.get(String(productId)) || [];
    const colors = [];
    const seenColors = new Set();
    for (const v of variants) {
      if (!v.color_id) continue;
      const cid = v.color_id?._id || v.color_id;
      if (seenColors.has(String(cid))) continue;
      seenColors.add(String(cid));
      colors.push({ id: cid, name: v.color_id?.name, hex: v.color_id?.hex });
    }
    return { colors, variants };
  }

  const availableItems = useMemo(
    () =>
      items.filter((item) => {
        const v = item.variant;
        const p = v?.product_id;
        return (
          v?.status !== false && p?.status !== false && (v?.stock || 0) > 0
        );
      }),
    [items],
  );

  const allSelected =
    availableItems.length > 0 &&
    availableItems.every((item) => {
      const key = item._id || item.product_variant_id;
      return selectedIds.has(key);
    });

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const ids = new Set();
      availableItems.forEach((item) => {
        ids.add(item._id || item.product_variant_id);
      });
      setSelectedIds(ids);
    }
  }, [allSelected, availableItems]);

  const toggleItem = useCallback((key) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectedTotal = useMemo(() => {
    let total = 0;
    for (const item of availableItems) {
      const key = item._id || item.product_variant_id;
      if (!selectedIds.has(key)) continue;
      const price = item.variant?.price || 0;
      const discount = item.variant?.discount || 0;
      total += price * (1 - discount / 100) * (item.quantity || 0);
    }
    return total;
  }, [availableItems, selectedIds]);

  const selectedCount = useMemo(() => {
    let count = 0;
    for (const item of availableItems) {
      const key = item._id || item.product_variant_id;
      if (selectedIds.has(key)) count += item.quantity || 0;
    }
    return count;
  }, [availableItems, selectedIds]);

  function handleConfirmClear() {
    clearCart();
    setConfirmClear(false);
  }

  function handleConfirmDeleteSelected() {
    for (const id of selectedIds) removeItem(id);
    setSelectedIds(new Set());
    setConfirmDeleteSelected(false);
  }

  if (loading || variantLoading) {
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
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          Giỏ hàng{" "}
          <span className="text-muted fs-6 fw-normal">
              ({availableItems.reduce((s, i) => s + (i.quantity || 0), 0)} sản phẩm)
          </span>
        </h2>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill mt-2 mt-md-0"
          onClick={() => setConfirmClear(true)}
        >
          <i className="bi bi-trash me-1"></i>Xóa tất cả
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12">
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
            const isUnavailable =
              variant?.status === false ||
              product?.status === false ||
              stock === 0;
            const isSelected = selectedIds.has(key);

            const productId = product?._id || product;
            const { colors, variants: prodVariants } =
              getAvailableOptions(productId);
            const currentColorId = color?._id || color;
            const currentSizeId = size?._id || size;

            const filteredVariants = prodVariants.filter((v) => {
              const vColorId = v.color_id?._id || v.color_id;
              return String(vColorId) === String(currentColorId);
            });
            const availableSizes = [];
            const seenSizes = new Set();
            for (const v of filteredVariants) {
              if (!v.size_id) continue;
              const sid = v.size_id?._id || v.size_id;
              if (seenSizes.has(String(sid))) continue;
              seenSizes.add(String(sid));
              availableSizes.push({ id: sid, name: v.size_id?.name || sid });
            }

            const colorsForSize = prodVariants.filter((v) => {
              const vSizeId = v.size_id?._id || v.size_id;
              return String(vSizeId) === String(currentSizeId) && v.color_id;
            });
            const availableColorsForSize = [];
            const seenColorsForSize = new Set();
            for (const v of colorsForSize) {
              const cid = v.color_id?._id || v.color_id;
              if (seenColorsForSize.has(String(cid))) continue;
              seenColorsForSize.add(String(cid));
              availableColorsForSize.push({
                id: cid,
                name: v.color_id?.name,
                hex: v.color_id?.hex,
              });
            }

            function handleColorChange(newColorId) {
              const matchingVariant = prodVariants.find((v) => {
                const vColorId = v.color_id?._id || v.color_id;
                const vSizeId = v.size_id?._id || v.size_id;
                return (
                  String(vColorId) === String(newColorId) &&
                  String(vSizeId) === String(currentSizeId)
                );
              });
              if (matchingVariant) {
                changeVariant(key, matchingVariant._id, {
                  _id: matchingVariant._id,
                  price: matchingVariant.price,
                  discount: matchingVariant.discount || 0,
                  stock: matchingVariant.stock,
                  status: matchingVariant.status,
                  color_id: matchingVariant.color_id,
                  size_id: matchingVariant.size_id,
                  product_id: product,
                });
              }
            }

            function handleSizeChange(newSizeId) {
              const matchingVariant = prodVariants.find((v) => {
                const vColorId = v.color_id?._id || v.color_id;
                const vSizeId = v.size_id?._id || v.size_id;
                return (
                  String(vColorId) === String(currentColorId) &&
                  String(vSizeId) === String(newSizeId)
                );
              });
              if (matchingVariant) {
                changeVariant(key, matchingVariant._id, {
                  _id: matchingVariant._id,
                  price: matchingVariant.price,
                  discount: matchingVariant.discount || 0,
                  stock: matchingVariant.stock,
                  status: matchingVariant.status,
                  color_id: matchingVariant.color_id,
                  size_id: matchingVariant.size_id,
                  product_id: product,
                });
              }
            }

            return (
              <div
                key={key}
                className={`card mb-3 border-0 shadow-sm rounded-4 overflow-hidden ${isUnavailable ? "opacity-50" : ""}`}
              >
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex gap-3 align-items-start">
                    {!isUnavailable && (
                      <input
                        type="checkbox"
                        className="form-check-input mt-1 flex-shrink-0"
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                        checked={isSelected}
                        onChange={() => toggleItem(key)}
                      />
                    )}
                    {isUnavailable && (
                      <div
                        className="flex-shrink-0 mt-1"
                        style={{ width: 18, height: 18 }}
                      />
                    )}

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
                          {isUnavailable ? (
                            <span className="badge bg-warning text-dark rounded-pill small mt-1">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Không còn khả dụng
                            </span>
                          ) : (
                            <div className="d-flex gap-2 mt-1 flex-wrap">
                              {availableColorsForSize.length > 0 && (
                                <select
                                  className="form-select form-select-sm w-auto"
                                  style={{ fontSize: "0.8rem" }}
                                  value={String(currentColorId)}
                                  onChange={(e) => handleColorChange(e.target.value)}
                                >
                                  {availableColorsForSize.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              )}
                              {availableSizes.length > 0 && (
                                <select
                                  className="form-select form-select-sm w-auto"
                                  style={{ fontSize: "0.8rem", minWidth: 70 }}
                                  value={String(currentSizeId)}
                                  onChange={(e) => handleSizeChange(e.target.value)}
                                >
                                  {availableSizes.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              )}
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
                        {!isUnavailable && (
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
                        )}
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

          <div
            className="position-sticky bottom-0 bg-white pt-3 pb-2"
            style={{ zIndex: 10 }}
          >
            <div className="d-flex flex-wrap align-items-center gap-3 p-3 border rounded-4 shadow-sm bg-light">
              {availableItems.length > 0 && (
                <>
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    style={{ width: 20, height: 20, cursor: "pointer" }}
                    checked={allSelected}
                    onChange={toggleAll}
                    id="selectAllBottom"
                  />
                  <label className="form-check-label small fw-semibold me-2" htmlFor="selectAllBottom" style={{ cursor: "pointer" }}>
                    Chọn tất cả ({availableItems.length})
                  </label>
                  {selectedIds.size > 0 && (
                    <button
                      className="btn btn-sm btn-outline-danger rounded-pill"
                      onClick={() => setConfirmDeleteSelected(true)}
                    >
                      <i className="bi bi-trash me-1"></i>Xóa đã chọn
                    </button>
                  )}
                </>
              )}
              <div className="ms-auto d-flex align-items-center gap-3">
                <div className="text-end">
                  <span className="text-muted small">Tổng cộng ({selectedCount} sp):</span>
                  <span className="fw-bold text-danger ms-2" style={{ fontSize: "1.1rem" }}>{formatPrice(selectedTotal)}</span>
                </div>
                <Link
                  href={`/thanh-toan?ids=${[...selectedIds].join(",")}`}
                  className={`btn btn-dark rounded-pill px-4 py-2 fw-semibold text-decoration-none ${selectedCount === 0 ? "disabled opacity-50 pe-none" : ""}`}
                >
                  {selectedCount === 0 ? "Chọn sản phẩm" : "Thanh toán"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmClear}
        title="Xóa tất cả"
        message="Bạn có chắc muốn xóa tất cả sản phẩm?"
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClear(false)}
      />
      <ConfirmModal
        show={confirmDeleteSelected}
        title="Xóa đã chọn"
        message={`Xóa ${selectedIds.size} sản phẩm đã chọn?`}
        onConfirm={handleConfirmDeleteSelected}
        onCancel={() => setConfirmDeleteSelected(false)}
      />
    </div>
  );
}
