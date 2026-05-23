/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";

const empty = { name: "", hex: "#000000" };

export default function ColorsPage() {
  const [items, setItems] = useState([]);
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
      const data = await api.colors.getAll();

      setItems(data);
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
    setForm({ name: item.name, hex: item.hex || "#000000" });
    setEditingId(item._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.colors.update(editingId, form);
      } else {
        await api.colors.create(form);
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
      await api.colors.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status" />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Colors</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add Color
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Hex</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No colors found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: item.hex }}
                  ></span>
                </td>
                <td>{item.name}</td>
                <td>
                  <code>{item.hex}</code>
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
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId ? "Edit Color" : "Add Color"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Hex Code</label>
                      <div className="input-group">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={form.hex}
                          onChange={(e) =>
                            setForm({ ...form, hex: e.target.value })
                          }
                          title="Choose color"
                        />
                        <input
                          className="form-control"
                          value={form.hex}
                          onChange={(e) =>
                            setForm({ ...form, hex: e.target.value })
                          }
                          placeholder="#000000"
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
        title="Delete Color"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
