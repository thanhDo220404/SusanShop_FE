"use client";
import { useState, useRef, useEffect } from "react";

export default function DropdownSelect({
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className={`dropdown ${className}`} ref={containerRef}>
      <button
        type="button"
        className="form-select rounded-3 text-start d-flex align-items-center"
        style={{ minWidth: 0 }}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={selected ? "" : "text-muted"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>
      <ul
        className={`dropdown-menu w-100 ${open ? "show" : ""}`}
        style={{ maxHeight: 240, overflowY: "auto" }}
      >
        <li>
          <button
            type="button"
            className="dropdown-item text-muted small"
            onClick={() => {
              onChange?.("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              className={`dropdown-item small ${String(opt.value) === String(value) ? "active" : ""}`}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
