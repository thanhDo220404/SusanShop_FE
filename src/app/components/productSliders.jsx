// components/ProductSlider.jsx

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function ProductSlider({
  title,
  link = "#",
  products = [],
  renderItem,
}) {
  return (
    <div className="container-fluid px-lg-5 my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">{title}</h2>

        <a href={link} className="text-decoration-none text-dark fw-semibold">
          Xem thêm →
        </a>
      </div>
      <div className="product-slider">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerGroup={2}
          spaceBetween={24}
          loop={true}
          breakpoints={{
            420: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            576: {
              slidesPerView: 3,
              spaceBetween: 12,
            },

            // laptop
            992: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
        >
          {products.map((item, index) => (
            <SwiperSlide key={index}>{renderItem(item)}</SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Slider */}
    </div>
  );
}
