"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";

const empty = { name: "", email: "", pass: "", phone: "", role: 0 };

export default function UsersPage() {
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
      const data = await api.users.getAll();
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
    setForm({
      name: item.name,
      email: item.email,
      pass: "",
      phone: item.phone || "",
      role: item.role ?? 0,
    });
    setEditingId(item._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.pass) delete payload.pass;
      if (editingId) {
        await api.users.update(editingId, payload);
      } else {
        await api.users.create(payload);
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
      await api.users.delete(deleteTarget._id);
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
        <h2>Users</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No users found
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone || "-"}</td>
                <td>
                  <span className={`badge ${item.role === 1 ? "bg-warning" : "bg-secondary"}`}>
                    {item.role === 1 ? "Admin" : "Customer"}
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
          <div className="modal-backdrop fade show" onClick={() => setShowForm(false)}></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingId ? "Edit User" : "Add User"}
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
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Password {editingId && "(leave blank to keep current)"}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.pass}
                        onChange={(e) => setForm({ ...form, pass: e.target.value })}
                        required={!editingId}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
                      >
                        <option value={0}>Customer</option>
                        <option value={1}>Admin</option>
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
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
