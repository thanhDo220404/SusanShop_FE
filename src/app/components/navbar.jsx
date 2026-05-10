"use client";
import { useState } from "react";

export default function Navbar() {
  const [top_man, setTop_man] = useState([
    "Áo Tanktop",
    "Áo thun",
    "Áo Thể Thao",
    "Áo Polo",
    "Áo Sơ Mi",
    "Áo Dài Tay",
    "Áo Sweater",
    "Áo Khoác",
    "Áo thun Graphic",
  ]);
  const [bottom_man, setBottom_man] = useState([
    "Quần Short",
    "Quần Jogger",
    "Quần Thể Thao",
    "Quần Dài",
    "Quần Pants",
    "Quần Jean",
    "Quần Kaki",
    "Đồ Bơi Nam",
  ]);
  const [underwear_man, setUnderwear_man] = useState([
    "Brief (Tam giác)",
    "Trunk (Boxer)",
    "Boxer Brief (Boxer dài)",
    "Long Leg",
  ]);
  const [accessories_man, setAccessories_man] = useState([
    "Dây chuyền",
    "Nhẫn",
    "Vòng tay",
    "Bông tai",
    "Thép không gỉ",
  ]);
  return (
    <nav className="navbar py-0 d-none d-lg-block position-static flex-grow-1">
      <ul className="m-0 p-0 d-flex justify-content-center gap-4">
        <li>
          <a href="" className="d-block text-primary">
            New
          </a>
          <div className="submenu p-5">
            <div className="d-flex justify-content-between">
              <div className="d-flex gap-5">
                <div>
                  <h6 className="text-uppercase fw-bold">
                    <a href="" className="title">
                      Tất cả sản phẩm{" "}
                      <i className="bi bi-arrow-right text-primary"></i>
                    </a>
                  </h6>
                  <ul className="p-0">
                    <li>
                      <a href="" className="fw-bold text-primary">
                        Sản phẩm mới
                      </a>
                    </li>
                    <li>
                      <a href="" className="fw-bold">
                        Bán chạy nhất
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="text-uppercase fw-bold">
                    <a href="" className="title">
                      Áo Nam <i className="bi bi-arrow-right text-primary"></i>
                    </a>
                  </h6>
                  <ul className="p-0">
                    <li>
                      <a href="">Tất cả</a>
                    </li>
                    {top_man.map((item, index) => (
                      <li key={index}>
                        <a href="" key={index}>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="text-uppercase fw-bold">
                    <a href="" className="title">
                      Quần Nam{" "}
                      <i className="bi bi-arrow-right text-primary"></i>
                    </a>
                  </h6>
                  <ul className="p-0">
                    <li>
                      <a href="">Tất cả</a>
                    </li>
                    {bottom_man.map((item, index) => (
                      <li key={index}>
                        <a href="" key={index}>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="text-uppercase fw-bold">
                    <a href="" className="title">
                      Quần Lót Nam{" "}
                      <i className="bi bi-arrow-right text-primary"></i>
                    </a>
                  </h6>
                  <ul className="p-0">
                    <li>
                      <a href="">Tất cả</a>
                    </li>
                    {underwear_man.map((item, index) => (
                      <li key={index}>
                        <a href="" key={index}>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="text-uppercase fw-bold">
                    <a href="" className="title">
                      PHụ kiện Nam{" "}
                      <i className="bi bi-arrow-right text-primary"></i>
                    </a>
                  </h6>
                  <ul className="p-0">
                    <li>
                      <a href="">Tất cả</a>
                    </li>
                    {accessories_man.map((item, index) => (
                      <li key={index}>
                        <a href="" key={index}>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="vr"></div>
              <div className="d-flex gap-3 flex-column">
                <img
                  src="https://n7media.coolmate.me/uploads/2026/03/25/FIFA_MASTERBannerMenu-1.jpg"
                  alt="Hình"
                  width={300}
                />
                <img
                  src="https://n7media.coolmate.me/uploads/2026/12/26/picknamdt_51.jpg"
                  alt="Hình"
                  width={300}
                />
              </div>
            </div>
          </div>
        </li>
        <li>
          <a href="" className="d-block ">
            Nam
          </a>
        </li>
        <li>
          <a href="" className="d-block text-decoration-none">
            Nữ
          </a>
        </li>
        <li>
          <a href="" className="d-block text-decoration-none">
            Thể thao
          </a>
        </li>
        <li>
          <a href="" className="d-block text-decoration-none">
            Phụ kiện
          </a>
        </li>
      </ul>
    </nav>
  );
}
