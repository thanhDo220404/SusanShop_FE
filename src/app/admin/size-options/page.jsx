"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";

const empty = { name: "", size_category_id: "" };

export default function SizeOptionsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const [data, cats] = await Promise.all([
        api.sizeOptions.getAll(),
        api.sizeCategories.getAll(),
      ]);
      setItems(data);
      setCategories(cats);
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
    setShowForm(true);
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      size_category_id: item.size_category_id?._id || item.size_category_id || "",
    });
    setEditingId(item._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.sizeOptions.update(editingId, form);
      } else {
        await api.sizeOptions.create(form);
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
      await api.sizeOptions.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  function getCatName(item) {
    return item.size_category_id?.name || "-";
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status" />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Size Options</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add Option
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No size options found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{getCatName(item)}</td>
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
          <div className="modal-backdrop fade show" onClick={() => setShowForm(false)}></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId ? "Edit Size Option" : "Add Size Option"}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Size Category</label>
                      <select
                        className="form-select"
                        value={form.size_category_id}
                        onChange={(e) => setForm({ ...form, size_category_id: e.target.value })}
                        required
                      >
                        <option value="">Select category...</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
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
        title="Delete Size Option"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
