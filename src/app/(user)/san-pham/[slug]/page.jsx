/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/app/components/productCard";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "d" : "";
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
  const [addedMsg, setAddedMsg] = useState("");
  const { addToCart, items } = useCart();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const all = await api.products.getAll();
        const productData = all.find((p) => p.slug === slug);
        if (!productData) {
          setLoading(false);
          return;
        }
        const allVars = await api.variants.getAll();
        const vars = allVars.filter((v) => {
          const vProdId = v.product_id?._id || v.product_id;
          return vProdId === productData._id;
        });
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
      setAddedMsg("Vui long chon mau sac va kich co");
      setTimeout(() => setAddedMsg(""), 2000);
      return;
    }
    if (!inStock) {
      setAddedMsg("San pham da het hang");
      setTimeout(() => setAddedMsg(""), 2000);
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
        setAddedMsg(`Gio hang da co ${currentStock}/${currentStock} san pham`);
        setTimeout(() => setAddedMsg(""), 2500);
        return;
      }
      setAddedMsg(`Chi con them duoc ${remaining} san pham nua`);
      setQuantity(remaining);
      setInputValue(String(remaining));
      setTimeout(() => setAddedMsg(""), 2000);
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
    setAddedMsg("Da them vao gio hang!");
    setTimeout(() => setAddedMsg(""), 2000);
  }

  return (
    <div className="container-fluid px-lg-5 py-4">
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

          <div className="d-flex gap-3 mb-4">
            <button
              className="btn btn-dark btn-lg rounded-pill px-5 py-3"
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

          {addedMsg && (
            <div
              className={`alert ${addedMsg.includes("het hang") || addedMsg.includes("chon") ? "alert-warning" : "alert-success"} py-2 mb-3`}
            >
              {addedMsg}
            </div>
          )}

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
            <div className="accordion-item border-0 border-top">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${activeTab !== "details" ? "collapsed" : ""} fw-semibold`}
                  onClick={() =>
                    setActiveTab(activeTab === "details" ? "" : "details")
                  }
                  style={{
                    background:
                      activeTab === "details" ? "#f8f9fa" : "transparent",
                  }}
                >
                  <i className="bi bi-info-circle me-2"></i>Chi tiet
                </button>
              </h2>
              <div
                className={`accordion-collapse collapse ${activeTab === "details" ? "show" : ""}`}
              >
                <div className="accordion-body">
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr>
                        <td
                          className="text-muted border-0 ps-0"
                          style={{ width: 120 }}
                        >
                          Danh muc
                        </td>
                        <td className="border-0 fw-medium">
                          {product.category_id?.name || "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted border-0 ps-0">Noi bat</td>
                        <td className="border-0">
                          {product.features ? (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-star-fill me-1"></i>Noi bat
                            </span>
                          ) : (
                            "Khong"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted border-0 ps-0">Trang thai</td>
                        <td className="border-0">
                          <span
                            className={`badge ${product.status ? "bg-success" : "bg-secondary"}`}
                          >
                            {product.status ? "Dang ban" : "Da an"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        const all = await api.products.getAll();
        const vars = await api.variants.getAll();
        const filtered = all
          .filter((p) => {
            const pCatId = p.category_id?._id || p.category_id;
            return p._id !== currentId && pCatId === categoryId;
          })
          .slice(0, 4)
          .map((p) => ({
            ...p,
            variants: vars.filter((v) => {
              const vProdId = v.product_id?._id || v.product_id;
              return vProdId === p._id;
            }),
          }));
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
