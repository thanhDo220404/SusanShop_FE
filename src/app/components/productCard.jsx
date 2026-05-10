export default function ProductCard() {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["#ffffff", "#1f2233", "#183b73"];

  return (
    <div className="product-card position-relative overflow-hidden">
      {/* Badge */}
      <span className="best-seller">BÁN CHẠY</span>

      {/* Image */}
      <div className="image-wrapper position-relative">
        <a href="" className="position-absolute d-block w-100 h-100"></a>
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b"
          alt="product"
          className="product-image"
          width={100}
        />
        {/* Hover Overlay */}
        <div className="quick-add">
          <h6 className="fw-semibold mb-3 text-light">
            Thêm nhanh vào giỏ hàng +
          </h6>

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {sizes.map((size) => (
              <button key={size} className="size-btn">
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color */}
      <div className="d-flex gap-2 mt-3">
        {colors.map((color, index) => (
          <button
            key={index}
            className={`color-btn ${index === 0 ? "color-btn-active" : ""}`}
            style={{ backgroundColor: color }}
          ></button>
        ))}
      </div>

      {/* Info */}
      <div className="mt-3">
        <h5 className="product-title">
          <a href="#">Váy thun Knit Aline Pickleball Driveshot Essentials</a>
        </h5>

        <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
          <span className="product-price">295.000đ</span>

          <span className="discount-badge">-50%</span>

          <span className="old-price">590.000đ</span>
        </div>
      </div>
    </div>
  );
}
