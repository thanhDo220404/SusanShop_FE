"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const empty = { code: "", type: "percent", value: 0, min_order: 0, max_discount: 0, usage_limit: 0, starts_at: "", ends_at: "", status: true };

export default function CouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    api.coupons.getAll().then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  function openCreate() { setForm(empty); setEditingId(null); setShowForm(true); }
  function openEdit(item) { setForm({ ...item, starts_at: item.starts_at?.slice(0, 10) || "", ends_at: item.ends_at?.slice(0, 10) || "" }); setEditingId(item._id); setShowForm(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), min_order: Number(form.min_order), max_discount: Number(form.max_discount), usage_limit: Number(form.usage_limit), starts_at: form.starts_at || null, ends_at: form.ends_at || null };
      if (editingId) await api.coupons.update(editingId, payload);
      else await api.coupons.create(payload);
      setShowForm(false);
      const data = await api.coupons.getAll();
      setItems(data);
      toast.success(editingId ? "Đã cập nhật" : "Đã tạo");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    try { await api.coupons.delete(deleteTarget._id); setDeleteTarget(null); setItems(items.filter((i) => i._id !== deleteTarget._id)); toast.success("Đã xóa"); }
    catch (err) { toast.error(err.message); }
  }

  if (loading) return <div className="text-center py-4"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Mã giảm giá</h4>
        <button className="btn btn-dark rounded-pill px-4" onClick={openCreate}><i className="bi bi-plus-lg me-1"></i>Thêm mã</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Đã dùng / Giới hạn</th>
              <th>Hiệu lực</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={8} className="text-center text-muted">Chưa có mã giảm giá</td></tr>}
            {items.map((item) => (
              <tr key={item._id}>
                <td><code className="fw-bold">{item.code}</code></td>
                <td>{item.type === "percent" ? "%" : "VNĐ"}</td>
                <td>{item.type === "percent" ? `${item.value}%` : item.value.toLocaleString("vi-VN") + "đ"}</td>
                <td>{item.min_order > 0 ? item.min_order.toLocaleString("vi-VN") + "đ" : "-"}</td>
                <td>{item.used_count} / {item.usage_limit > 0 ? item.usage_limit : "∞"}</td>
                <td className="small">{item.starts_at ? new Date(item.starts_at).toLocaleDateString("vi-VN") : "..."} - {item.ends_at ? new Date(item.ends_at).toLocaleDateString("vi-VN") : "..."}</td>
                <td><span className={`badge ${item.status ? "bg-success" : "bg-secondary"}`}>{item.status ? "Active" : "Inactive"}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(item)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(item)}><i className="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowForm(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content rounded-4 border-0 shadow">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header border-0 px-4 pt-4">
                    <h5 className="modal-title fw-bold">{editingId ? "Sửa mã" : "Thêm mã"}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                  </div>
                  <div className="modal-body px-4">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">Mã</label>
                        <input className="form-control form-control-sm rounded-3" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Loại</label>
                        <select className="form-select form-select-sm rounded-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                          <option value="percent">%</option>
                          <option value="fixed">VNĐ</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Giá trị</label>
                        <input className="form-control form-control-sm rounded-3" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} min={0} max={form.type === "percent" ? 100 : 999999999} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">Đơn tối thiểu</label>
                        <input className="form-control form-control-sm rounded-3" type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} min={0} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">Giảm tối đa</label>
                        <input className="form-control form-control-sm rounded-3" type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} min={0} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small">Giới hạn lượt</label>
                        <input className="form-control form-control-sm rounded-3" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} min={0} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Ngày bắt đầu</label>
                        <input className="form-control form-control-sm rounded-3" type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Ngày kết thúc</label>
                        <input className="form-control form-control-sm rounded-3" type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="status" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} />
                          <label className="form-check-label small" htmlFor="status">Kích hoạt</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 px-4 pb-4">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowForm(false)}>Hủy</button>
                    <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal show={!!deleteTarget} title="Xóa mã" message={`Xóa mã "${deleteTarget?.code}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
