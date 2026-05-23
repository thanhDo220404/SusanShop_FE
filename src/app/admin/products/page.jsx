/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";
import DropdownSelect from "../components/DropdownSelect";

const emptyProduct = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  status: true,
  features: false,
  image_ids: [],
};

const emptyVariant = {
  price: "",
  discount: 0,
  color_id: "",
  size_id: "",
  stock: 0,
  status: true,
  sale_starts_at: "",
  sale_ends_at: "",
};

function toSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[dD]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const TABLE_CELL = {
  padding: "6px 8px",
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
};
const INPUT_CLASS =
  "form-control form-control-sm border-0 bg-transparent shadow-none text-center";
const SELECT_CLASS =
  "form-select form-select-sm border-0 bg-transparent shadow-none";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [allSizeOptions, setAllSizeOptions] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [variants, setVariants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [varPage, setVarPage] = useState(0);
  const PAGE_SIZE = 15;

  const slugConflict = useMemo(() => {
    if (!form.slug) return false;
    return items.some(
      (item) => item.slug === form.slug && item._id !== editingId,
    );
  }, [form.slug, items, editingId]);

  const filteredSizes = useMemo(() => {
    if (!form.category_id) return [];
    const cat = categories.find((c) => c._id === form.category_id);
    if (!cat) return [];
    const sizeCatId = cat.size_category_id?._id || cat.size_category_id;
    if (!sizeCatId) return [];
    return allSizeOptions.filter((s) => {
      const sCatId = s.size_category_id?._id || s.size_category_id;
      return String(sCatId) === String(sizeCatId);
    });
  }, [form.category_id, categories, allSizeOptions]);

  const totalPages = Math.ceil(variants.length / PAGE_SIZE);
  const pagedVariants = variants.slice(
    varPage * PAGE_SIZE,
    (varPage + 1) * PAGE_SIZE,
  );

  async function fetchItems() {
    try {
      setLoading(true);
      const [data, cats, cols, sizes, media] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
        api.colors.getAll(),
        api.sizeOptions.getAll(),
        api.media.getAll(),
      ]);
      setItems(data);
      setCategories(cats);
      setColors(cols);
      setAllSizeOptions(sizes);
      setMediaList(media);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openCreate() {
    setForm(emptyProduct);
    setVariants([]);
    setEditingId(null);
    setSlugEdited(false);
    setVarPage(0);
    setShowForm(true);
  }

  async function openEdit(item) {
    setForm({
      category_id: item.category_id?._id || item.category_id || "",
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      status: item.status ?? true,
      features: item.features ?? false,
      image_ids: item.images?.map((img) => img._id || img) || [],
    });
    try {
      const allVars = await api.variants.getAll();
      const prodVars = allVars.filter((v) => {
        const vProdId = v.product_id?._id || v.product_id;
        return String(vProdId) === String(item._id);
      });
      setVariants(
        prodVars.map((v) => ({
          _id: v._id,
          price: v.price ?? "",
          discount: v.discount ?? 0,
          color_id: v.color_id?._id || v.color_id || "",
          size_id: v.size_id?._id || v.size_id || "",
          stock: v.stock ?? 0,
          status: v.status ?? true,
          sale_starts_at: v.sale_starts_at ? v.sale_starts_at.slice(0, 10) : "",
          sale_ends_at: v.sale_ends_at ? v.sale_ends_at.slice(0, 10) : "",
        })),
      );
    } catch {
      setVariants([]);
    }
    setEditingId(item._id);
    setSlugEdited(true);
    setVarPage(0);
    setShowForm(true);
  }

  function handleNameChange(value) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: !editingId && !slugEdited ? toSlug(value) : prev.slug,
    }));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
    setVarPage(Math.floor(variants.length / PAGE_SIZE));
  }
  function updateVariant(idx, field, value) {
    setVariants((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], [field]: value };
      return u;
    });
  }
  function removeVariant(idx) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function colorName(id) {
    return colors.find((c) => c._id === id)?.name || "-";
  }
  function sizeName(id) {
    return allSizeOptions.find((s) => s._id === id)?.name || "-";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!variants.length) {
      alert("Cần ít nhất 1 variant");
      return;
    }
    setSaving(true);
    try {
      let productResult = editingId
        ? await api.products.update(editingId, form)
        : await api.products.create(form);
      const productId = productResult._id;
      const existingVarIds = variants.filter((v) => v._id).map((v) => v._id);
      if (editingId) {
        const allVars = await api.variants.getAll();
        const oldVars = allVars.filter(
          (v) =>
            String(v.product_id?._id || v.product_id) === String(productId),
        );
        for (const ov of oldVars) {
          if (!existingVarIds.includes(ov._id))
            await api.variants.delete(ov._id);
        }
      }
      for (const v of variants) {
        const payload = {
          product_id: productId,
          price: Number(v.price),
          discount: Number(v.discount),
          stock: Number(v.stock),
          sale_starts_at: v.sale_starts_at || null,
          sale_ends_at: v.sale_ends_at || null,
          color_id: v.color_id || null,
          size_id: v.size_id || null,
          status: v.status,
        };
        if (v._id) await api.variants.update(v._id, payload);
        else await api.variants.create(payload);
      }
      setShowForm(false);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const allVars = await api.variants.getAll();
      const toDel = allVars.filter(
        (v) =>
          String(v.product_id?._id || v.product_id) ===
          String(deleteTarget._id),
      );
      for (const v of toDel) await api.variants.delete(v._id).catch(() => {});
      await api.products.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0" style={{ letterSpacing: "-0.3px" }}>
          Sản phẩm
        </h4>
        <button className="btn btn-dark rounded-pill px-4" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Thêm sản phẩm
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {items.map((item) => (
          <div key={item._id} className="col-xl-4 col-md-6">
            <div
              className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
              style={{ transition: "box-shadow 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
            >
              <div className="p-3">
                <div className="d-flex gap-3">
                  <div
                    className="rounded-3 overflow-hidden flex-shrink-0"
                    style={{ width: 72, height: 72, background: "#f0f2f5" }}
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0].url || item.images[0].secure_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h6
                      className="fw-bold mb-1 text-truncate"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {item.name}
                    </h6>
                    <div className="d-flex gap-2 align-items-center">
                      <small className="text-muted">
                        {item.category_id?.name || "-"}
                      </small>
                      <span
                        className="badge rounded-pill"
                        style={{
                          fontSize: "0.65rem",
                          background: item.status ? "#d4edda" : "#e9ecef",
                          color: item.status ? "#155724" : "#6c757d",
                        }}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                      {item.features && (
                        <span
                          className="badge rounded-pill bg-warning text-dark"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-1 mt-3 pt-2 border-top">
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => openEdit(item)}
                  >
                    <i className="bi bi-pencil me-1"></i>Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            Chưa có sản phẩm nào.
          </div>
        )}
      </div>

      {showForm && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowForm(false)}
          />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header border-0 px-4 pt-4 pb-0">
                    <h5 className="modal-title fw-bold">
                      {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowForm(false)}
                    />
                  </div>
                  <div
                    className="modal-body px-4 pb-0"
                    style={{ maxHeight: "75vh", overflowY: "auto" }}
                  >
                    {/* Basic info */}
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Tên sản phẩm
                        </label>
                        <input
                          className="form-control rounded-3"
                          value={form.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-muted">
                          Slug{" "}
                          {!slugEdited && !editingId && form.name && (
                            <span className="text-muted">(auto)</span>
                          )}
                        </label>
                        <input
                          className={cn(
                            "form-control rounded-3",
                            slugConflict && "is-invalid",
                          )}
                          value={form.slug}
                          onChange={(e) => {
                            setSlugEdited(true);
                            setForm((p) => ({ ...p, slug: e.target.value }));
                          }}
                          required
                        />
                        {slugConflict && (
                          <div className="invalid-feedback d-block">
                            Slug đã tồn tại
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-muted">
                          Danh mục
                        </label>
                       <DropdownSelect
                          value={form.category_id}
                          onChange={(val) =>
                            setForm({ ...form, category_id: val })
                          }
                          options={categories.map((c) => ({
                            value: c._id,
                            label: c.name,
                          }))}
                          placeholder="Chọn danh mục..."
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-semibold text-muted">
                          Trạng thái
                        </label>
                        <DropdownSelect
                          value={form.status ? "true" : "false"}
                          onChange={(val) =>
                            setForm({
                              ...form,
                              status: val === "true",
                            })
                          }
                          options={[
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                          ]}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-semibold text-muted">
                          Nổi bật
                        </label>
                        <DropdownSelect
                          value={form.features ? "true" : "false"}
                          onChange={(val) =>
                            setForm({
                              ...form,
                              features: val === "true",
                            })
                          }
                          options={[
                            { value: "false", label: "No" },
                            { value: "true", label: "Yes" },
                          ]}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-muted">
                          Mô tả
                        </label>
                        <textarea
                          className="form-control rounded-3"
                          rows={1}
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Hình ảnh ({form.image_ids.length} đã chọn)
                      </label>
                      <div
                        className="border rounded-3 p-3"
                        style={{ maxHeight: 170, overflowY: "auto" }}
                      >
                        {mediaList.length === 0 && (
                          <p className="text-muted text-center my-2 small">
                            Chưa có ảnh. Vào Media để upload.
                          </p>
                        )}
                        <div className="d-flex flex-wrap gap-2">
                          {mediaList.map((m) => {
                            const sel = form.image_ids.includes(m._id);
                            return (
                              <div
                                key={m._id}
                                onClick={() => {
                                  setForm((prev) => {
                                    const ids = [...prev.image_ids];
                                    const i = ids.indexOf(m._id);
                                    if (i > -1) ids.splice(i, 1);
                                    else ids.push(m._id);
                                    return { ...prev, image_ids: ids };
                                  });
                                }}
                                className={cn(
                                  "rounded-3 overflow-hidden position-relative",
                                  sel && "ring-2",
                                )}
                                style={{
                                  cursor: "pointer",
                                  width: 80,
                                  height: 80,
                                  border: sel
                                    ? "2px solid #0d6efd"
                                    : "2px solid #eee",
                                }}
                              >
                                <img
                                  src={m.url || m.secure_url}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                {sel && (
                                  <span
                                    className="position-absolute top-0 end-0 badge bg-primary rounded-pill m-1"
                                    style={{ fontSize: "0.55rem" }}
                                  >
                                    <i className="bi bi-check"></i>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">
                        Biến thể ({variants.length})
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark rounded-pill"
                        onClick={addVariant}
                      >
                        <i className="bi bi-plus-lg me-1"></i>Thêm
                      </button>
                    </div>

                    <div className="border rounded-3 overflow-hidden mb-3">
                      <div style={{ overflowX: "auto" }}>
                        <table
                          className="table table-sm table-borderless mb-0 align-middle"
                          style={{ minWidth: 1000 }}
                        >
                          <thead className="bg-light">
                            <tr>
                              <th style={TABLE_CELL}>#</th>
                              <th style={TABLE_CELL}>Giá</th>
                              <th style={TABLE_CELL}>% Giảm</th>
                              <th style={TABLE_CELL}>Tồn kho</th>
                              <th style={TABLE_CELL}>Màu</th>
                              <th style={TABLE_CELL}>Size</th>
                              <th style={TABLE_CELL}>Trạng thái</th>
                              <th style={TABLE_CELL}>KM từ</th>
                              <th style={TABLE_CELL}>KM đến</th>
                              <th style={{ ...TABLE_CELL, width: 64 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedVariants.map((v, idx) => {
                              const realIdx = varPage * PAGE_SIZE + idx;
                              return (
                                <tr key={realIdx}>
                                  <td
                                    style={TABLE_CELL}
                                    className="text-muted small"
                                  >
                                    {realIdx + 1}
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <input
                                      type="number"
                                      className={INPUT_CLASS}
                                      style={{ width: 90 }}
                                      value={v.price}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "price",
                                          e.target.value,
                                        )
                                      }
                                      min={0}
                                    />
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <input
                                      type="number"
                                      className={INPUT_CLASS}
                                      style={{ width: 55 }}
                                      value={v.discount}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "discount",
                                          e.target.value,
                                        )
                                      }
                                      min={0}
                                      max={100}
                                    />
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <input
                                      type="number"
                                      className={INPUT_CLASS}
                                      style={{ width: 65 }}
                                      value={v.stock}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "stock",
                                          e.target.value,
                                        )
                                      }
                                      min={0}
                                    />
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <div className="d-flex align-items-center gap-1">
                                      {v.color_id &&
                                        colors.find(
                                          (c) => c._id === v.color_id,
                                        ) && (
                                          <span
                                            style={{
                                              width: 16,
                                              height: 16,
                                              borderRadius: "50%",
                                              background: colors.find(
                                                (c) => c._id === v.color_id,
                                              ).hex,
                                              border: "1px solid #ddd",
                                              display: "inline-block",
                                            }}
                                          />
                                        )}
                                      <select
                                        className={SELECT_CLASS}
                                        style={{ width: 110 }}
                                        value={v.color_id}
                                        onChange={(e) =>
                                          updateVariant(
                                            realIdx,
                                            "color_id",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">-</option>
                                        {colors.map((c) => (
                                          <option key={c._id} value={c._id}>
                                            {c.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <select
                                      className={SELECT_CLASS}
                                      style={{ width: 70 }}
                                      value={v.size_id}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "size_id",
                                          e.target.value,
                                        )
                                      }
                                      disabled={
                                        !filteredSizes.length &&
                                        !!form.category_id
                                      }
                                    >
                                      <option value="">-</option>
                                      {filteredSizes.map((s) => (
                                        <option key={s._id} value={s._id}>
                                          {s.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <select
                                      className={SELECT_CLASS}
                                      style={{ width: 80 }}
                                      value={v.status}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "status",
                                          e.target.value === "true",
                                        )
                                      }
                                    >
                                      <option value="true">Active</option>
                                      <option value="false">Inactive</option>
                                    </select>
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <input
                                      type="date"
                                      className={INPUT_CLASS}
                                      style={{
                                        width: 120,
                                        fontSize: "0.75rem",
                                      }}
                                      value={v.sale_starts_at}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "sale_starts_at",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td style={TABLE_CELL}>
                                    <input
                                      type="date"
                                      className={INPUT_CLASS}
                                      style={{
                                        width: 120,
                                        fontSize: "0.75rem",
                                      }}
                                      value={v.sale_ends_at}
                                      onChange={(e) =>
                                        updateVariant(
                                          realIdx,
                                          "sale_ends_at",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td
                                    style={{
                                      ...TABLE_CELL,
                                      textAlign: "right",
                                    }}
                                  >
                                    <div className="d-flex gap-1 justify-content-end">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary py-0 px-1"
                                        title="Nhân bản"
                                        onClick={() => {
                                          const copy = { ...v };
                                          delete copy._id;
                                          setVariants((prev) => {
                                            const n = [...prev];
                                            n.splice(realIdx + 1, 0, copy);
                                            return n;
                                          });
                                        }}
                                      >
                                        <i className="bi bi-copy"></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger py-0 px-1"
                                        onClick={() => removeVariant(realIdx)}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {variants.length === 0 && (
                        <p className="text-muted text-center py-4 small mb-0">
                          Nhấn &quot;Thêm&quot; để tạo biến thể đầu tiên.
                        </p>
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                          disabled={varPage === 0}
                          onClick={() => setVarPage((p) => p - 1)}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <span className="small text-muted">
                          {varPage + 1} / {totalPages}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                          disabled={varPage >= totalPages - 1}
                          onClick={() => setVarPage((p) => p + 1)}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4 pt-0">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4"
                      onClick={() => setShowForm(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-dark rounded-pill px-4"
                      disabled={saving || slugConflict}
                    >
                      {saving
                        ? "Đang lưu..."
                        : slugConflict
                          ? "Sửa slug trước"
                          : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Xóa sản phẩm"
        message={`Xóa "${deleteTarget?.name}"? Tất cả biến thể cũng sẽ bị xóa.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
