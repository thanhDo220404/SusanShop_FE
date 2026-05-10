export default function Footer() {
  return (
    <footer className="bg-black text-white pt-5 pb-4">
      <div className="container">
        {/* Top */}
        <div className="row gy-5 pb-5">
          {/* Left */}
          <div className="col-lg-6">
            <h2 className="fw-bold display-5 mb-4">COOLMATE lắng nghe bạn!</h2>

            <p className="text-secondary fs-5 lh-lg">
              Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng
              góp từ khách hàng để có thể nâng cấp trải nghiệm dịch vụ và sản
              phẩm tốt hơn nữa.
            </p>

            <button className="btn btn-light rounded-pill px-4 py-3 fw-bold mt-3">
              ĐÓNG GÓP Ý KIẾN →
            </button>
          </div>

          {/* Right */}
          <div className="col-lg-6">
            {/* Hotline */}
            <div className="d-flex align-items-center gap-4 mb-4">
              <i className="bi bi-telephone-fill fs-1"></i>

              <div>
                <span className="text-secondary">Hotline</span>

                <h3 className="fw-bold mb-0">1900.272737 - 028.7777.2737</h3>
              </div>
            </div>

            {/* Email */}
            <div className="d-flex align-items-center gap-4 mb-5">
              <i className="bi bi-envelope-fill fs-1"></i>

              <div>
                <span className="text-secondary">Email</span>

                <h3 className="fw-bold mb-0">Cool@coolmate.me</h3>
              </div>
            </div>

            {/* Social */}
            <div className="d-flex gap-3 flex-wrap">
              <a
                href=""
                className="border border-secondary rounded-4 d-flex align-items-center justify-content-center text-white text-decoration-none"
                style={{ width: "58px", height: "58px" }}
              >
                <i className="bi bi-facebook fs-4"></i>
              </a>

              <a
                href=""
                className="border border-secondary rounded-4 d-flex align-items-center justify-content-center text-white text-decoration-none fw-bold"
                style={{ width: "58px", height: "58px" }}
              >
                Zalo
              </a>

              <a
                href=""
                className="border border-secondary rounded-4 d-flex align-items-center justify-content-center text-white text-decoration-none"
                style={{ width: "58px", height: "58px" }}
              >
                <i className="bi bi-tiktok fs-4"></i>
              </a>

              <a
                href=""
                className="border border-secondary rounded-4 d-flex align-items-center justify-content-center text-white text-decoration-none"
                style={{ width: "58px", height: "58px" }}
              >
                <i className="bi bi-instagram fs-4"></i>
              </a>

              <a
                href=""
                className="border border-secondary rounded-4 d-flex align-items-center justify-content-center text-white text-decoration-none"
                style={{ width: "58px", height: "58px" }}
              >
                <i className="bi bi-youtube fs-4"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        {/* Middle */}
        <div className="row gy-5 py-5">
          <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold mb-4">COOLCLUB</h5>

            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary">
              <li>Tài khoản CoolClub</li>
              <li>Đăng kí thành viên</li>
              <li>Ưu đãi & Đặc quyền</li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold mb-4">CHÍNH SÁCH</h5>

            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary">
              <li>Chính sách đổi trả tại cửa hàng</li>
              <li>Chính sách đổi trả 60 ngày online</li>
              <li>Chính sách khuyến mãi</li>
              <li>Chính sách bảo mật</li>
              <li>Chính sách giao hàng</li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold mb-4">CHĂM SÓC KHÁCH HÀNG</h5>

            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary">
              <li>Trải nghiệm mua sắm 100% hài lòng</li>
              <li>Hỏi đáp - FAQs</li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold mb-4">VỀ COOLMATE</h5>

            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary">
              <li>Quy tắc ứng xử của Coolmate</li>
              <li>Coolmate 101</li>
              <li>DVKH xuất sắc</li>
              <li>Câu chuyện về Coolmate</li>
              <li>Nhà máy</li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h5 className="fw-bold mb-4">ĐỊA CHỈ LIÊN HỆ</h5>

            <ul className="list-unstyled d-flex flex-column gap-4 text-secondary lh-lg">
              <li>
                Cửa hàng: B2-34, Tầng B2, Hanoi Centre, 175 Nguyễn Thái Học,
                Đống Đa, Hà Nội
              </li>

              <li>
                Văn phòng Hà Nội: Tầng 3-4, Tòa nhà BMM, Km2, Đường Phùng Hưng,
                Hà Đông, Hà Nội
              </li>

              <li>
                Trung tâm vận hành Hà Nội: Lô C8, KCN Lai Yên, Hoài Đức, Hà Nội
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-top border-secondary pt-4 mt-4 text-secondary small">
          <p className="mb-2 fw-bold text-white">© CÔNG TY TNHH FASTECH ASIA</p>

          <p className="mb-0">
            Mã số doanh nghiệp: 0108617038. Giấy chứng nhận đăng ký doanh nghiệp
            do Sở Kế hoạch và Đầu tư TP Hà Nội cấp lần đầu ngày 20/02/2019.
          </p>
        </div>
      </div>
    </footer>
  );
}
