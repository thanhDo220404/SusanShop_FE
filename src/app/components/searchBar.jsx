"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SearchBar({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const doSearch = useCallback(async (keyword) => {
    if (!keyword || keyword.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.products.search(keyword.trim());
      setResults(data);
      setOpen(data.length > 0);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      onNavigate?.();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        window.location.href = `/san-pham/${results[selectedIndex].slug}`;
      } else if (results.length > 0) {
        window.location.href = `/san-pham?q=${encodeURIComponent(query)}`;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const imageUrl = (product) => {
    const img = product.images?.[0];
    if (!img) return null;
    return img.url || img;
  };

  return (
    <div className="search-wrapper" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="search-input"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />
      {query && (
        <button className="search-clear" onClick={clearSearch}>
          <i className="bi bi-x-lg"></i>
        </button>
      )}
      <button
        className="search-icon"
        onClick={() => {
          if (query.trim()) {
            onNavigate?.();
            window.location.href = `/san-pham?q=${encodeURIComponent(query)}`;
          }
        }}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }}></span>
        ) : (
          <i className="bi bi-search"></i>
        )}
      </button>

      {open && results.length > 0 && (
        <div className="search-dropdown">
          <div className="search-dropdown-header">
            <span className="fw-semibold">Sản phẩm</span>
            <span className="text-muted small">{results.length} kết quả</span>
          </div>
          {results.map((product, idx) => (
            <Link
              key={product._id}
              href={`/san-pham/${product.slug}`}
              className={`search-item ${idx === selectedIndex ? "active" : ""}`}
              onClick={() => { setOpen(false); onNavigate?.(); }}
            >
              <div className="search-item-img">
                {imageUrl(product) ? (
                  <img src={imageUrl(product)} alt={product.name} />
                ) : (
                  <div className="search-item-placeholder">
                    <i className="bi bi-image"></i>
                  </div>
                )}
              </div>
              <div className="search-item-info">
                <div className="search-item-name">{product.name}</div>
                {product.category_id && (
                  <div className="search-item-cat">{product.category_id.name}</div>
                )}
              </div>
              <i className="bi bi-arrow-up-right search-item-arrow"></i>
            </Link>
          ))}
          <Link
            href={`/san-pham?q=${encodeURIComponent(query)}`}
            className="search-view-all"
            onClick={() => { setOpen(false); onNavigate?.(); }}
          >
            Xem tất cả kết quả <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}
    </div>
  );
}
