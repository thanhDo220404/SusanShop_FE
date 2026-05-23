/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";
import DropdownSelect from "../components/DropdownSelect";

const empty = {
  name: "",
  slug: "",
  description: "",
  size_category_id: "",
  parent_category_id: "",
  status: true,
  sort_order: 0,
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

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [sizeCats, setSizeCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const slugConflict = useMemo(() => {
    if (!form.slug) return false;
    return items.some(
      (item) => item.slug === form.slug && item._id !== editingId,
    );
  }, [form.slug, items, editingId]);

  async function fetchItems() {
    try {
      setLoading(true);
      const [data, sizes] = await Promise.all([
        api.categories.getAll(),
        api.sizeCategories.getAll(),
      ]);

      const sortedCategories = data.sort((a, b) => a.sort_order - b.sort_order);
      console.log("data: ", data);

      setItems(sortedCategories);
      setSizeCats(sizes);
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
    setForm(empty);
    setEditingId(null);
    setSlugEdited(false);
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      size_category_id:
        item.size_category_id?._id || item.size_category_id || "",
      parent_category_id:
        item.parent_category_id?._id || item.parent_category_id || "",
      status: item.status ?? true,
      sort_order: item.sort_order ?? 0,
    });
    setEditingId(item._id);
    setSlugEdited(true);
    setShowForm(true);
  }

  function handleNameChange(value) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: !slugEdited && !editingId ? toSlug(value) : prev.slug,
    }));
  }

  function handleSlugChange(value) {
    setSlugEdited(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        size_category_id: form.size_category_id || null,
        parent_category_id: form.parent_category_id || null,
        sort_order: Number(form.sort_order),
      };
      if (editingId) {
        await api.categories.update(editingId, payload);
      } else {
        await api.categories.create(payload);
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
      await api.categories.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  function getParentName(item) {
    if (item.parent_category_id?._id) {
      return item.parent_category_id.name;
    }
    if (item.parent_category_id) {
      const found = items.find((i) => i._id === item.parent_category_id);
      return found ? found.name : item.parent_category_id;
    }
    return "-";
  }

  function getSizeCatName(item) {
    return item.size_category_id?.name || "-";
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status" />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categories</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add Category
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Parent</th>
              <th>Size Category</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No categories found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id}>
                <td className="fw-semibold">{item.name}</td>
                <td>
                  <code>{item.slug}</code>
                </td>
                <td>{getParentName(item)}</td>
                <td>{getSizeCatName(item)}</td>
                <td>
                  <span
                    className={`badge ${item.status ? "bg-success" : "bg-secondary"}`}
                  >
                    {item.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{item.sort_order}</td>
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
                      {editingId ? "Edit Category" : "Add Category"}
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
                        <label className="form-label">Name</label>
                        <input
                          className="form-control"
                          value={form.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Slug
                          {!slugEdited && !editingId && form.name && (
                            <span className="text-muted small ms-1">
                              (auto)
                            </span>
                          )}
                        </label>
                        <input
                          className={`form-control ${slugConflict ? "is-invalid" : ""}`}
                          value={form.slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          required
                        />
                        {slugConflict && (
                          <div className="invalid-feedback d-block">
                            Slug da ton tai. Vui long doi slug khac.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Parent Category</label>
                        <DropdownSelect
                          value={form.parent_category_id}
                          onChange={(val) =>
                            setForm({
                              ...form,
                              parent_category_id: val,
                            })
                          }
                          options={items
                            .filter((i) => i._id !== editingId)
                            .map((c) => ({
                              value: c._id,
                              label: c.name,
                            }))}
                          placeholder="None (top level)"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Size Category</label>
                        <DropdownSelect
                          value={form.size_category_id}
                          onChange={(val) =>
                            setForm({
                              ...form,
                              size_category_id: val,
                            })
                          }
                          options={sizeCats.map((c) => ({
                            value: c._id,
                            label: c.name,
                          }))}
                          placeholder="None"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Sort Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.sort_order}
                          onChange={(e) =>
                            setForm({ ...form, sort_order: e.target.value })
                          }
                        />
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
                      disabled={saving || slugConflict}
                    >
                      {saving
                        ? "Saving..."
                        : slugConflict
                          ? "Fix slug first"
                          : "Save"}
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
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
