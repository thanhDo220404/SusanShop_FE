/* eslint-disable react-hooks/purity */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProductCard from "@/app/components/productCard";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + " đ" : "";
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const { addToCart, items } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const allVars = await api.variants.getAll();

        const productMap = new Map();
        for (const v of allVars) {
          const p = v.product_id;
          if (!p || !p.status) continue;
          if (v.status === false) continue;
          const pid = p._id || p;
          if (!productMap.has(pid)) {
            productMap.set(pid, { ...p, variants: [] });
          }
          productMap.get(pid).variants.push(v);
        }

        const productData = [...productMap.values()].find(
          (p) => p.slug === slug,
        );
        if (!productData) {
          setLoading(false);
          return;
        }
        const vars = productData.variants || [];
        setProduct(productData);
        setVariants(vars);
        if (vars.length > 0) {
          const firstColor = vars.find((v) => v.color_id);
          if (firstColor) {
            setSelectedColor(firstColor.color_id?._id || firstColor.color_id);
          }
          const firstSize = vars.find((v) => v.size_id);
          if (firstSize) {
            setSelectedSize(firstSize.size_id?._id || firstSize.size_id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      api.reviews
        .getByProductId(product._id)
        .then(setReviews)
        .catch(() => {});
    }
  }, [product?._id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantity(1);
    setInputValue("1");
  }, [selectedColor, selectedSize]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Dang tai...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-5">
        <i className="bi bi-emoji-frown fs-1 text-muted"></i>
        <h2 className="mt-3">Khong tim thay san pham</h2>
        <Link href="/san-pham" className="btn btn-primary mt-3">
          Xem tat ca san pham
        </Link>
      </div>
    );
  }

  const images = product.images || [];

  const currentImage =
    images[selectedImage]?.url ||
    images[selectedImage]?.secure_url ||
    "https://res.cloudinary.com/duhmqsywm/image/upload/v1779262540/3694bd21-b0bd-4e47-83ed-58825dfe3771.png";

  const colors = variants
    .filter((v) => v.color_id)
    .map((v) => ({
      id: v.color_id?._id || v.color_id,
      hex: v.color_id?.hex,
      name: v.color_id?.name,
    }))
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const allSizes = variants
    .filter((v) => v.size_id)
    .map((v) => ({ id: v.size_id?._id || v.size_id, name: v.size_id?.name }))
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  const filteredSizes = selectedColor
    ? variants
        .filter((v) => {
          const colorId = v.color_id?._id || v.color_id;
          return colorId === selectedColor && v.size_id;
        })
        .map((v) => ({
          id: v.size_id?._id || v.size_id,
          name: v.size_id?.name,
        }))
        .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    : allSizes;

  const currentVariant = variants.find((v) => {
    const colorId = v.color_id?._id || v.color_id;
    const sizeId = v.size_id?._id || v.size_id;
    return colorId === selectedColor && sizeId === selectedSize;
  });

  const displayPrice = currentVariant?.price;
  const displayDiscount = currentVariant?.discount || 0;
  const salePrice =
    displayPrice && displayDiscount
      ? displayPrice * (1 - displayDiscount / 100)
      : displayPrice;
  const inStock = currentVariant ? currentVariant.stock > 0 : false;
  const currentStock = currentVariant?.stock || 0;
  const lowStock = currentStock > 0 && currentStock <= 5;

  function clampQuantity(val) {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (currentStock > 0 && num > currentStock) num = currentStock;
    return num;
  }

  function handleQuantityInput(e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setInputValue("");
      return;
    }
    let num = parseInt(raw, 10);
    if (currentStock > 0 && num > currentStock) num = currentStock;
    setInputValue(String(num));
    setQuantity(num);
  }

  function handleQuantityBlur() {
    const num = clampQuantity(inputValue);
    setQuantity(num);
    setInputValue(String(num));
  }

  function handleQuantityKeyDown(e) {
    if (e.key === "Enter") {
      e.target.blur();
    }
  }

  function handleAddToCart() {
    if (!currentVariant) {
      toast.error("Vui long chon mau sac va kich co");
      return;
    }
    if (!inStock) {
      toast.error("San pham da het hang");
      return;
    }

    const cartItem = items.find(
      (item) => item.product_variant_id === currentVariant._id,
    );
    const inCart = cartItem?.quantity || 0;
    const total = inCart + quantity;

    if (total > currentStock) {
      const remaining = currentStock - inCart;
      if (remaining <= 0) {
        toast.error(`Gio hang da co ${currentStock}/${currentStock} san pham`);
        return;
      }
      toast(`Chi con them duoc ${remaining} san pham nua`, { icon: "⚠️" });
      setQuantity(remaining);
      setInputValue(String(remaining));
      return;
    }

    const variantData = {
      _id: currentVariant._id,
      price: currentVariant.price,
      discount: currentVariant.discount || 0,
      stock: currentVariant.stock,
      color_id: currentVariant.color_id,
      size_id: currentVariant.size_id,
      product_id: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
      },
    };
    addToCart(currentVariant._id, quantity, variantData);
    toast.success("Da them vao gio hang!");
  }

  return (
    <div className="container-fluid px-lg-5 py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description:
              product.description?.replace(/<[^>]*>/g, "").substring(0, 300) ||
              "",
            image: images[0]?.url || images[0]?.secure_url || "",
            sku: product._id,
            category: product.category_id?.name || "",
            offers: {
              "@type": "Offer",
              price: salePrice || displayPrice || 0,
              priceCurrency: "VND",
              availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "Susan Shop",
              },
            },
          }),
        }}
      />
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Trang chu</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/san-pham">San pham</Link>
          </li>
          {product.category_id && (
            <li className="breadcrumb-item">
              <Link href={`/danh-muc/${product.category_id.slug}`}>
                {product.category_id.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-lg-6">
          <div
            className="position-relative overflow-hidden rounded-4 mb-3"
            style={{ background: "#f8f9fa" }}
          >
            <img
              src={currentImage}
              alt={product.name}
              className="w-100"
              style={{ height: 600, objectFit: "cover" }}
            />
            {displayDiscount > 0 && (
              <span className="position-absolute top-0 start-0 m-3 badge bg-danger fs-6 px-3 py-2 rounded-pill">
                -{displayDiscount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`rounded-3 overflow-hidden ${idx === selectedImage ? "ring-primary" : ""}`}
                  style={{
                    width: 80,
                    height: 80,
                    cursor: "pointer",
                    border:
                      idx === selectedImage
                        ? "2px solid #0d6efd"
                        : "2px solid transparent",
                    opacity: idx === selectedImage ? 1 : 0.6,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    if (idx !== selectedImage)
                      e.currentTarget.style.opacity = "0.6";
                  }}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img
                    src={img.url || img.secure_url}
                    alt={img.alt_text || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-6">
          <h1 className="fw-bold mb-2">{product.name}</h1>
          {product.category_id && (
            <p className="text-muted mb-3">
              Danh muc:{" "}
              <Link
                href={`/danh-muc/${product.category_id.slug}`}
                className="text-primary"
              >
                {product.category_id.name}
              </Link>
            </p>
          )}

          {displayPrice != null && (
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="fs-3 fw-bold text-danger">
                {salePrice != null
                  ? formatPrice(salePrice)
                  : formatPrice(displayPrice)}
              </span>
              {displayDiscount > 0 && (
                <>
                  <span className="badge bg-danger fs-6">
                    -{displayDiscount}%
                  </span>
                  <span className="text-decoration-line-through text-muted fs-5">
                    {formatPrice(displayPrice)}
                  </span>
                </>
              )}
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Mau sac</h6>
              <div className="d-flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    className={`color-btn ${color.id === selectedColor ? "color-btn-active" : ""}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    onClick={() => setSelectedColor(color.id)}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {filteredSizes.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Kich co</h6>
              <div className="d-flex flex-wrap gap-2">
                {filteredSizes.map((size) => (
                  <button
                    key={size.id}
                    className={`size-btn text-center border ${size.id === selectedSize ? "bg-dark text-white" : ""}`}
                    onClick={() => setSelectedSize(size.id)}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h6 className="fw-bold mb-2">So luong</h6>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div
                className="d-inline-flex align-items-center border rounded-pill overflow-hidden"
                style={{ minWidth: 140 }}
              >
                <button
                  className="btn btn-sm border-0 rounded-0 px-3"
                  onClick={() => {
                    const num = clampQuantity(quantity - 1);
                    setQuantity(num);
                    setInputValue(String(num));
                  }}
                  disabled={quantity <= 1}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleQuantityInput}
                  onBlur={handleQuantityBlur}
                  onKeyDown={handleQuantityKeyDown}
                  className="form-control-plaintext text-center fw-bold border-0 px-0"
                  style={{
                    width: 52,
                    outline: "none",
                    boxShadow: "none",
                    background: "transparent",
                  }}
                />
                <button
                  className="btn btn-sm border-0 rounded-0 px-3"
                  onClick={() => {
                    const num = clampQuantity(quantity + 1);
                    setQuantity(num);
                    setInputValue(String(num));
                  }}
                  disabled={currentStock > 0 && quantity >= currentStock}
                >
                  <i className="bi bi-plus"></i>
                </button>
              </div>

              <button
                className="btn btn-dark rounded-pill px-4"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a, #333)",
                  border: "none",
                  transition: "all 0.3s ease",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
                onClick={handleAddToCart}
                disabled={!inStock}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #0d6efd, #6610f2)";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(13,110,253,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #1a1a1a, #333)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <i className="bi bi-cart-plus me-2"></i>
                {inStock ? "THEM VAO GIO HANG" : "HET HANG"}
              </button>
            </div>
            <div className="mt-2">
              {inStock && lowStock && (
                <small className="text-warning">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Chi con {currentStock} san pham
                </small>
              )}
              {inStock && !lowStock && (
                <small className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Con hang ({currentStock} san pham)
                </small>
              )}
              {!inStock && selectedColor && selectedSize && (
                <small className="text-danger">
                  <i className="bi bi-x-circle me-1"></i>
                  Het hang
                </small>
              )}
            </div>
          </div>

          <div
            className="accordion border rounded-3 overflow-hidden"
            id="productInfo"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${activeTab !== "description" ? "collapsed" : ""} fw-semibold`}
                  onClick={() =>
                    setActiveTab(
                      activeTab === "description" ? "" : "description",
                    )
                  }
                  style={{
                    background:
                      activeTab === "description" ? "#f8f9fa" : "transparent",
                  }}
                >
                  <i className="bi bi-file-text me-2"></i>Mo ta san pham
                </button>
              </h2>
              <div
                className={`accordion-collapse collapse ${activeTab === "description" ? "show" : ""}`}
              >
                <div
                  className="accordion-body text-muted"
                  style={{ fontSize: "0.95rem", lineHeight: 1.8 }}
                >
                  {product.description || "Chua co mo ta."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-5">
          <h3 className="fw-bold mb-4">Danh gia san pham</h3>
          <ReviewsList reviews={reviews} />
        </div>
      )}

      <RelatedProducts
        currentId={product._id}
        categoryId={product.category_id?._id || product.category_id}
      />
    </div>
  );
}

function RelatedProducts({ currentId, categoryId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const allVars = await api.variants.getAll();

        const productMap = new Map();
        for (const v of allVars) {
          const p = v.product_id;
          if (!p || !p.status) continue;
          if (v.status === false) continue;
          const pid = p._id || p;
          if (!productMap.has(pid)) {
            productMap.set(pid, { ...p, variants: [] });
          }
          productMap.get(pid).variants.push(v);
        }

        const filtered = [...productMap.values()]
          .filter((p) => {
            const pCatId = p.category_id?._id || p.category_id;
            return p._id !== currentId && String(pCatId) === String(categoryId);
          })
          .slice(0, 4);
        setRelated(filtered);
      } catch (err) {
        console.error(err);
      }
    }
    if (categoryId) fetchRelated();
  }, [currentId, categoryId]);

  if (related.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="fw-bold mb-4">San pham lien quan</h3>
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}

function ReviewsList({ reviews, compact }) {
  const [ratingFilter, setRatingFilter] = useState(0);
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    ratingCounts[r.rating - 1]++;
  });

  const filtered = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews;

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    if (hrs < 24) return `${hrs} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return `${Math.floor(days / 365)} năm trước`;
  }

  return (
    <div>
      {!compact && reviews.length > 0 && (
        <div
          className="rounded-4 p-4 mb-4"
          style={{
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        >
          <div className="row align-items-center">
            <div className="col-md-4 text-center mb-3 mb-md-0">
              <div
                className="display-3 fw-bold text-white mb-0"
                style={{ lineHeight: 1 }}
              >
                {avgRating}
              </div>
              <div className="d-flex justify-content-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi ${star <= Math.round(avgRating) ? "bi-star-fill" : "bi-star"}`}
                    style={{ color: "#ffc107", fontSize: "1.1rem" }}
                  />
                ))}
              </div>
              <small className="text-white-50">{reviews.length} đánh giá</small>
            </div>
            <div className="col-md-8">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star - 1];
                const pct =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                const active = ratingFilter === star;
                return (
                  <div
                    key={star}
                    className="d-flex align-items-center gap-3 mb-2"
                    style={{
                      cursor: "pointer",
                      opacity: ratingFilter && !active ? 0.4 : 1,
                    }}
                    onClick={() => setRatingFilter(active ? 0 : star)}
                  >
                    <small className="text-white-50" style={{ width: 16 }}>
                      {star}
                    </small>
                    <i
                      className="bi bi-star-fill text-warning"
                      style={{ fontSize: "0.75rem" }}
                    />
                    <div
                      className="flex-grow-1 rounded-pill overflow-hidden"
                      style={{
                        height: 6,
                        background: "rgba(255,255,255,0.15)",
                      }}
                    >
                      <div
                        className="h-100 rounded-pill"
                        style={{
                          width: `${pct}%`,
                          background: active
                            ? "#ffc107"
                            : "rgba(255,255,255,0.4)",
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                    <small className="text-white-50" style={{ width: 24 }}>
                      {count}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {compact && reviews.length > 0 && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="fw-bold text-warning" style={{ fontSize: "1.1rem" }}>
            {avgRating}
          </span>
          <div className="d-flex gap-0">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${star <= Math.round(avgRating) ? "bi-star-fill" : "bi-star"}`}
                style={{
                  color: star <= Math.round(avgRating) ? "#ffc107" : "#ddd",
                  fontSize: "0.7rem",
                }}
              />
            ))}
          </div>
          <small className="text-muted">({reviews.length})</small>
          {ratingFilter > 0 && (
            <button
              className="btn btn-sm btn-outline-warning rounded-pill"
              style={{ fontSize: "0.6rem", padding: "0 8px" }}
              onClick={() => setRatingFilter(0)}
            >
              <i className="bi bi-x me-1"></i>
              {ratingFilter} sao
            </button>
          )}
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {filtered.map((review) => (
          <div
            key={review._id}
            className={`rounded-3 ${compact ? "p-2 bg-light" : "p-3 border"}`}
            style={
              compact
                ? {}
                : { borderColor: "#eee", transition: "all 0.2s ease" }
            }
          >
            <div className="d-flex gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{
                  width: compact ? 32 : 40,
                  height: compact ? 32 : 40,
                  fontSize: compact ? "0.75rem" : "0.9rem",
                  background: `linear-gradient(135deg, ${["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6", "#f59e0b"][review.user_id?.name?.charCodeAt(0) % 6]}, ${["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#0d9488", "#d97706"][review.user_id?.name?.charCodeAt(0) % 6]})`,
                }}
              >
                {review.user_id?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <span
                    className="fw-semibold"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {review.user_id?.name || "Ẩn danh"}
                  </span>
                  <span
                    className="badge rounded-pill"
                    style={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    <i className="bi bi-check2-circle me-1"></i>Đã mua hàng
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="d-flex gap-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                        style={{
                          color: star <= review.rating ? "#ffc107" : "#e0e0e0",
                          fontSize: "0.7rem",
                        }}
                      />
                    ))}
                  </div>
                  {review.product_variant_id?.color_id?.name && (
                    <span
                      className="badge bg-light text-dark border"
                      style={{ fontSize: "0.65rem" }}
                    >
                      <span
                        className="d-inline-block rounded-circle me-1"
                        style={{
                          width: 8,
                          height: 8,
                          background:
                            review.product_variant_id.color_id.name === "Đen"
                              ? "#000"
                              : review.product_variant_id.color_id.name ===
                                  "Trắng"
                                ? "#ccc"
                                : "#666",
                          verticalAlign: "middle",
                        }}
                      ></span>
                      {review.product_variant_id.color_id.name}
                    </span>
                  )}
                  {review.product_variant_id?.size_id?.name && (
                    <span
                      className="badge bg-light text-dark border"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {review.product_variant_id.size_id.name}
                    </span>
                  )}
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {timeAgo(review.createdAt)}
                  </small>
                </div>
                {review.content && (
                  <p
                    className="mt-2 mb-0"
                    style={{
                      fontSize: "0.875rem",
                      color: "#444",
                      lineHeight: 1.6,
                    }}
                  >
                    {review.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
