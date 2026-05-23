/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";
import DropdownSelect from "../components/DropdownSelect";

const empty = {
  product_id: "",
  price: "",
  discount: 0,
  sale_starts_at: "",
  sale_ends_at: "",
  color_id: "",
  size_id: "",
  stock: 0,
  status: true,
};

export default function VariantsPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [allSizeOptions, setAllSizeOptions] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState([]);
  const [selectedSizeCatName, setSelectedSizeCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function fetchItems() {
    try {
      setLoading(true);
      const [data, prods, cats, cols, sizes] = await Promise.all([
        api.variants.getAll(),
        api.products.getAll(),
        api.categories.getAll(),
        api.colors.getAll(),
        api.sizeOptions.getAll(),
      ]);
      setItems(data);
      setProducts(prods);
      setCategories(cats);
      setColors(cols);
      setAllSizeOptions(sizes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleProductChange(productId) {
    setForm((prev) => ({ ...prev, product_id: productId, size_id: "" }));
    applySizeFilter(productId);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function openCreate() {
    setForm(empty);
    setEditingId(null);
    setShowForm(true);
  }

  function applySizeFilter(productId) {
    if (!productId) {
      setFilteredSizes([]);
      setSelectedSizeCatName("");
      return;
    }
    const product = products.find((p) => p._id === productId);
    if (!product?.category_id) {
      setFilteredSizes([]);
      setSelectedSizeCatName("");
      return;
    }
    const sizeCatId =
      typeof product.category_id === "object"
        ? product.category_id.size_category_id?._id ||
          product.category_id.size_category_id
        : null;
    if (!sizeCatId) {
      setFilteredSizes([]);
      setSelectedSizeCatName("");
      return;
    }
    const cat = categories.find((c) => c._id === sizeCatId);
    setSelectedSizeCatName(cat?.name || "");
    const sizes = allSizeOptions.filter((s) => {
      const sCatId = s.size_category_id?._id || s.size_category_id;
      return sCatId === sizeCatId;
    });
    setFilteredSizes(sizes);
  }

  function openEdit(item) {
    const productId = item.product_id?._id || item.product_id || "";
    setForm({
      product_id: productId,
      price: item.price ?? "",
      discount: item.discount ?? 0,
      sale_starts_at: item.sale_starts_at
        ? item.sale_starts_at.slice(0, 10)
        : "",
      sale_ends_at: item.sale_ends_at ? item.sale_ends_at.slice(0, 10) : "",
      color_id: item.color_id?._id || item.color_id || "",
      size_id: item.size_id?._id || item.size_id || "",
      stock: item.stock ?? 0,
      status: item.status ?? true,
    });
    setEditingId(item._id);
    setShowForm(true);
    if (productId) applySizeFilter(productId);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discount: Number(form.discount),
        stock: Number(form.stock),
        sale_starts_at: form.sale_starts_at || null,
        sale_ends_at: form.sale_ends_at || null,
        color_id: form.color_id || null,
        size_id: form.size_id || null,
      };
      if (editingId) {
        await api.variants.update(editingId, payload);
      } else {
        await api.variants.create(payload);
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
      await api.variants.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatPrice(n) {
    return n != null ? n.toLocaleString("vi-VN") + " VND" : "-";
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status" />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Product Variants</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add Variant
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Sale Period</th>
              <th>Color</th>
              <th>Size</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No variants found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.product_id?.name || item.product_id || "-"}</td>
                <td>{formatPrice(item.price)}</td>
                <td>{item.discount || 0}%</td>
                <td className="small">
                  {item.sale_starts_at
                    ? new Date(item.sale_starts_at).toLocaleDateString()
                    : "-"}
                  {item.sale_ends_at
                    ? ` - ${new Date(item.sale_ends_at).toLocaleDateString()}`
                    : ""}
                </td>
                <td>
                  {item.color_id && (
                    <>
                      <span
                        className="color-swatch me-1"
                        style={{ backgroundColor: item.color_id.hex }}
                      ></span>
                      {item.color_id.name}
                    </>
                  )}
                  {!item.color_id && "-"}
                </td>
                <td>{item.size_id?.name || "-"}</td>
                <td>
                  <span
                    className={`badge ${item.stock > 0 ? "bg-success" : "bg-danger"}`}
                  >
                    {item.stock}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${item.status ? "bg-success" : "bg-secondary"}`}
                  >
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEdit(item)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowForm(false)}
          ></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId ? "Edit Variant" : "Add Variant"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Product</label>
                        <DropdownSelect
                          value={form.product_id}
                          onChange={(val) => handleProductChange(val)}
                          options={products.map((p) => ({
                            value: p._id,
                            label: p.name,
                          }))}
                          placeholder="Select product..."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price (VND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                          required
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Discount (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.discount}
                          onChange={(e) =>
                            setForm({ ...form, discount: e.target.value })
                          }
                          min={0}
                          max={100}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({ ...form, stock: e.target.value })
                          }
                          min={0}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Status</label>
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
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Sale Starts At</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.sale_starts_at}
                          onChange={(e) =>
                            setForm({ ...form, sale_starts_at: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Sale Ends At</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.sale_ends_at}
                          onChange={(e) =>
                            setForm({ ...form, sale_ends_at: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Color</label>
                        <DropdownSelect
                          value={form.color_id}
                          onChange={(val) =>
                            setForm({ ...form, color_id: val })
                          }
                          options={colors.map((c) => ({
                            value: c._id,
                            label: c.name,
                          }))}
                          placeholder="None"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Size
                          {selectedSizeCatName && (
                            <span className="text-muted small ms-2">
                              ({selectedSizeCatName})
                            </span>
                          )}
                        </label>
                        <DropdownSelect
                          value={form.size_id}
                          onChange={(val) =>
                            setForm({ ...form, size_id: val })
                          }
                          options={filteredSizes.map((s) => ({
                            value: s._id,
                            label: s.name,
                          }))}
                          placeholder="None"
                          disabled={!form.product_id || filteredSizes.length === 0}
                        />
                        {form.product_id && filteredSizes.length === 0 && (
                          <div className="form-text text-warning">
                            Category has no size category assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
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
        title="Delete Variant"
        message={`Delete this variant?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
