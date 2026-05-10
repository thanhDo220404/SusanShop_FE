export default function Banner() {
  const banners = [
    {
      src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      caption: (
        <>
          <h1 className="display-2 fw-bold">BỘ SƯU TẬP MỚI</h1>

          <p className="fs-4">Thời trang mùa hè 2026</p>

          <button className="btn btn-light px-4 py-2">MUA NGAY</button>
        </>
      ),
    },
    {
      src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
      caption: (
        <>
          <h1 className="display-2 fw-bold">PHONG CÁCH NAM</h1>

          <p className="fs-4">Đơn giản & hiện đại</p>

          <button className="btn btn-light px-4 py-2">KHÁM PHÁ</button>
        </>
      ),
    },
    {
      src: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      caption: (
        <>
          <h1 className="display-2 fw-bold">GIẢM GIÁ LỚN</h1>

          <p className="fs-4">Giảm đến 50%</p>

          <button className="btn btn-light px-4 py-2">MUA NGAY</button>
        </>
      ),
    },
  ];
  return (
    <div
      id="bannerSlide"
      className="carousel slide vh-100"
      data-bs-ride="carousel"
    >
      {/* nút chấm */}
      <div className="carousel-indicators">
        {banners.map((item, index) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <button
              key={index}
              type="button"
              data-bs-target="#bannerSlide"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
            ></button>
          );
        })}
      </div>

      {/* slide */}
      <div className="carousel-inner h-100">
        {banners.map((item, index) => {
          return (
            <div
              key={index}
              className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
            >
              <img
                src={item.src}
                className="d-block w-100 h-100 object-fit-cover"
                alt=""
              />

              <div className="carousel-caption top-50 translate-middle-y">
                {item.caption}
              </div>
              {/* dữ liệu phải là class thay vì className
              <div
                className="carousel-caption top-50 translate-middle-y"
                dangerouslySetInnerHTML={{
                  __html: item.caption,
                }}
              ></div> */}
            </div>
          );
        })}

        {/* <div className="carousel-item active h-100">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            className="d-block w-100 h-100 object-fit-cover"
            alt=""
          />

          <div className="carousel-caption top-50 translate-middle-y">
            <h1 className="display-2 fw-bold">BỘ SƯU TẬP MỚI</h1>

            <p className="fs-4">Thời trang mùa hè 2026</p>

            <button className="btn btn-light px-4 py-2">MUA NGAY</button>
          </div>
        </div>

        <div className="carousel-item h-100">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
            className="d-block w-100 h-100 object-fit-cover"
            alt=""
          />

          <div className="carousel-caption top-50 translate-middle-y">
            <h1 className="display-2 fw-bold">PHONG CÁCH NAM</h1>

            <p className="fs-4">Đơn giản & hiện đại</p>

            <button className="btn btn-light px-4 py-2">KHÁM PHÁ</button>
          </div>
        </div>

        <div className="carousel-item h-100">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            className="d-block w-100 h-100 object-fit-cover"
            alt=""
          />

          <div className="carousel-caption top-50 translate-middle-y">
            <h1 className="display-2 fw-bold">GIẢM GIÁ LỚN</h1>

            <p className="fs-4">Giảm đến 50%</p>

            <button className="btn btn-light px-4 py-2">MUA NGAY</button>
          </div>
        </div> */}
      </div>

      {/* nút trái */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#bannerSlide"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon"></span>
      </button>

      {/* nút phải */}
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#bannerSlide"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}
