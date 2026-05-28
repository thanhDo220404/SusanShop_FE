"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";
import DropdownSelect from "../components/DropdownSelect";
import toast from "react-hot-toast";

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
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q),
    );
  }, [items, search]);

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
      setItems(data.sort((a, b) => a.sort_order - b.sort_order));
      setSizeCats(sizes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

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
      size_category_id: item.size_category_id?._id || item.size_category_id || "",
      parent_category_id: item.parent_category_id?._id || item.parent_category_id || "",
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
        toast.success("Đã cập nhật danh mục");
      } else {
        await api.categories.create(payload);
        toast.success("Đã tạo danh mục");
      }
      setShowForm(false);
      await fetchItems();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.categories.delete(deleteTarget._id);
      setDeleteTarget(null);
      toast.success("Đã xóa danh mục");
      await fetchItems();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function getParentName(item) {
    if (item.parent_category_id?._id) return item.parent_category_id.name;
    if (item.parent_category_id) {
      const found = items.find((i) => i._id === item.parent_category_id);
      return found ? found.name : item.parent_category_id;
    }
    return "-";
  }

  const tree = useMemo(() => {
    const map = {};
    const roots = [];
    for (const item of filtered) {
      map[item._id] = { ...item, children: [] };
    }
    for (const item of filtered) {
      const parentId = item.parent_category_id?._id || item.parent_category_id;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[item._id]);
      } else {
        roots.push(map[item._id]);
      }
    }
    return roots;
  }, [filtered]);

  function renderRow(item, depth = 0) {
    const rows = [];
    rows.push(
      <tr key={item._id}>
        <td className="fw-semibold" style={{ paddingLeft: `${16 + depth * 28}px` }}>
          {depth > 0 && (
            <span className="me-1" style={{ color: "#d1d5db" }}>└</span>
          )}
          {item.name}
        </td>
        <td><code className="small">{item.slug}</code></td>
        <td className="text-muted small">{getParentName(item)}</td>
        <td className="small text-muted">{item.size_category_id?.name || "-"}</td>
        <td>
          <span className={`badge rounded-pill ${item.status ? "bg-success" : "bg-secondary"}`} style={{ fontSize: "0.7rem" }}>
            {item.status ? "Hiện" : "Ẩn"}
          </span>
        </td>
        <td className="small">{item.sort_order}</td>
        <td className="pe-4">
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => openEdit(item)}>
              <i className="bi bi-pencil"></i>
            </button>
            <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setDeleteTarget(item)}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    );
    for (const child of (item.children || [])) {
      rows.push(...renderRow(child, depth + 1));
    }
    return rows;
  }

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: "#6366f1" }} /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-grid me-2" style={{ color: "#6366f1" }}></i>Danh mục ({items.length})
        </h4>
        <button className="btn btn-dark rounded-pill px-4" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Thêm danh mục
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0 rounded-start-pill">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 rounded-end-pill ps-0"
            placeholder="Tìm tên hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ boxShadow: "none" }}
          />
          {search && (
            <button className="btn btn-outline-secondary rounded-pill ms-2" onClick={() => setSearch("")}>
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Danh mục cha</th>
                  <th>Size áp dụng</th>
                  <th>Trạng thái</th>
                  <th>Thứ tự</th>
                  <th className="pe-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      {search.trim() ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
                    </td>
                  </tr>
                ) : (
                  tree.reduce((acc, root) => acc.concat(renderRow(root)), [])
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowForm(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 rounded-4 shadow">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header border-0 px-4 pt-4 pb-2">
                    <h5 className="modal-title fw-bold">
                      {editingId ? "Sửa danh mục" : "Thêm danh mục"}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">Tên</label>
                        <input className="form-control rounded-3" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">
                          Slug
                          {!slugEdited && !editingId && form.name && <span className="text-muted small ms-1">(tự động)</span>}
                        </label>
                        <input className={`form-control rounded-3 ${slugConflict ? "is-invalid" : ""}`} value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} required />
                        {slugConflict && <div className="invalid-feedback d-block">Slug đã tồn tại</div>}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Mô tả</label>
                      <textarea className="form-control rounded-3" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">Danh mục cha</label>
                        <DropdownSelect
                          value={form.parent_category_id}
                          onChange={(val) => setForm({ ...form, parent_category_id: val })}
                          options={items.filter((i) => i._id !== editingId).map((c) => ({ value: c._id, label: c.name }))}
                          placeholder="Không (gốc)"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">Size áp dụng</label>
                        <DropdownSelect
                          value={form.size_category_id}
                          onChange={(val) => setForm({ ...form, size_category_id: val })}
                          options={sizeCats.map((c) => ({ value: c._id, label: c.name }))}
                          placeholder="Không"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">Trạng thái</label>
                        <DropdownSelect
                          value={form.status ? "true" : "false"}
                          onChange={(val) => setForm({ ...form, status: val === "true" })}
                          options={[{ value: "true", label: "Hiện" }, { value: "false", label: "Ẩn" }]}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small fw-semibold">Thứ tự</label>
                        <input type="number" className="form-control rounded-3" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowForm(false)}>Hủy</button>
                    <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving || slugConflict}>
                      {saving ? "Đang lưu..." : slugConflict ? "Sửa slug trước" : editingId ? "Cập nhật" : "Tạo mới"}
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
        title="Xóa danh mục"
        message={`Xóa "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
