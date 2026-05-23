/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";

function formatPrice(n) {
  return n != null ? n.toLocaleString("vi-VN") + "d" : "";
}

export default function ProductCard({ product }) {
  if (!product) {
    return (
      <div className="product-card position-relative overflow-hidden">
        <div className="image-wrapper position-relative">
          <div className="product-image bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-secondary" role="status" />
          </div>
        </div>
        <div className="mt-3">
          <div className="placeholder-glow">
            <span className="placeholder col-10"></span>
            <span className="placeholder col-6 mt-2"></span>
          </div>
        </div>
      </div>
    );
  }

  const firstImage = product.images?.[0];
  const imageUrl =
    firstImage?.url ||
    firstImage?.secure_url ||
    "https://res.cloudinary.com/duhmqsywm/image/upload/v1779262540/3694bd21-b0bd-4e47-83ed-58825dfe3771.png";

  const variants = product.variants || [];
  const basePrice = variants[0]?.price;
  const discount = variants[0]?.discount || 0;
  const salePrice =
    basePrice && discount ? basePrice * (1 - discount / 100) : basePrice;

  const slug = product.slug || "";
  const displayName = product._colorLabel
    ? `${product.name} - ${product._colorLabel}`
    : product.name;

  return (
    <div className="product-card position-relative overflow-hidden">
      {product.features && <span className="best-seller">NỔI BẬT</span>}

      <div className="image-wrapper position-relative">
        <Link
          href={`/san-pham/${slug}`}
          className="position-absolute d-block w-100 h-100"
        />
        <img
          src={imageUrl}
          alt={displayName}
          className="product-image"
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <h5 className="product-title d-inline">
          <Link href={`/san-pham/${slug}`}>{displayName}</Link>
        </h5>
        <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
          {salePrice != null && (
            <span className="product-price">{formatPrice(salePrice)}</span>
          )}
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
          {discount > 0 && basePrice != null && (
            <span className="old-price">{formatPrice(basePrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
