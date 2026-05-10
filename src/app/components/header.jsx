"use client";
import Navbar from "./navbar";
export default function Header() {
  return (
    <>
      {/* <div className="container-fluid" style={{ backgroundColor: "#737373" }}>
        hello
      </div> */}
      <header className="header container-fluid px-0">
        <div className="container-fluid px-lg-5">
          <div className="d-flex gap-4 position-relative py-1 py-lg-0 justify-content-between align-items-center">
            <div className="fs-2 flex-grow-1">Susan</div>
            <Navbar></Navbar>
            <div className="w-auto position-relative">
              <input
                type="text"
                name=""
                id=""
                placeholder="Search for items"
                className="search-input rounded-pill p-3"
              />
              <button className="search-icon position-absolute top-50 translate-middle-y">
                <i className="bi bi-search "></i>
              </button>
            </div>
            <div className="d-flex fs-5 gap-4 align-items-center">
              <a href="" className="d-block fs-3">
                <i className="bi bi-person-fill "></i>
              </a>
              <a href="" className="d-block position-relative">
                <i className="bi bi-bag-fill fs-4"></i>
                <span
                  style={{ fontSize: "10px" }}
                  className="position-absolute top-100 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  3
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>
      {/* <div className="container-fluid" style={{ backgroundColor: "#737373" }}>
        hello
      </div> */}
    </>
  );
}
