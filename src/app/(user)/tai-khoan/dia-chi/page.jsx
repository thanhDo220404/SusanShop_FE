"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/api";
import ConfirmModal from "@/app/components/ConfirmModal";
import toast from "react-hot-toast";

function formatPhone(phone) {
  if (!phone) return "";
  const s = phone.replace(/\D/g, "");
  if (s.length === 10) return `${s.slice(0,4)} ${s.slice(4,7)} ${s.slice(7)}`;
  return phone;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", province: "", district: "", ward: "", street: "" });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v1/?depth=1").then((r) => r.json()).then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.userAddresses.getByUserId(user._id).then(setAddresses).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  async function handleProvinceChange(code) {
    setForm((f) => ({ ...f, province: code, district: "", ward: "" }));
    setDistricts([]); setWards([]);
    if (code) {
      const res = await fetch(`https://provinces.open-api.vn/api/v1/p/${code}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
    }
  }

  async function handleDistrictChange(code) {
    setForm((f) => ({ ...f, district: code, ward: "" }));
    setWards([]);
    if (code) {
      const res = await fetch(`https://provinces.open-api.vn/api/v1/d/${code}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    }
  }

  function getProvinceName(code) { return provinces.find((p) => String(p.code) === String(code))?.name || ""; }
  function getDistrictName(code) { return districts.find((d) => String(d.code) === String(code))?.name || ""; }
  function getWardName(code) { return wards.find((w) => String(w.code) === String(code))?.name || ""; }

  function openCreate() {
    setForm({ name: user?.name || "", phone: user?.phone || "", province: "", district: "", ward: "", street: "" });
    setEditingId(null);
    setDistricts([]);
    setWards([]);
    setShowForm(true);
  }

  function openEdit(addr) {
    if (provinces.length === 0) {
      toast.error("Đang tải dữ liệu, vui lòng thử lại");
      return;
    }
    const provinceCode = provinces.find((p) => p.name === addr.province)?.code || "";
    setForm({
      name: addr.name, phone: addr.phone,
      province: provinceCode,
      district: addr.district,
      ward: addr.ward,
      street: addr.street,
    });
    setEditingId(addr._id);
    if (provinceCode) {
      fetch(`https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`).then((r) => r.json()).then((d) => {
        setDistricts(d.districts || []);
        const districtCode = (d.districts || []).find((dt) => dt.name === addr.district)?.code || "";
        if (districtCode) {
          setForm((prev) => ({ ...prev, district: districtCode }));
          fetch(`https://provinces.open-api.vn/api/v1/d/${districtCode}?depth=2`).then((r) => r.json()).then((d2) => {
            setWards(d2.wards || []);
            const wardCode = (d2.wards || []).find((w) => w.name === addr.ward)?.code || "";
            if (wardCode) setForm((prev) => ({ ...prev, ward: wardCode }));
          });
        }
      });
    }
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: user._id,
        ward: getWardName(form.ward),
        district: getDistrictName(form.district),
        province: getProvinceName(form.province),
      };
      if (editingId) {
        await api.userAddresses.update(editingId, payload);
      } else {
        await api.userAddresses.create(payload);
      }
      setShowForm(false);
      const data = await api.userAddresses.getByUserId(user._id);
      setAddresses(data);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.userAddresses.delete(deleteTarget);
      setAddresses((prev) => prev.filter((a) => a._id !== deleteTarget));
    } catch (err) { toast.error(err.message); }
    finally { setDeleteTarget(null); }
  }

  async function handleSetDefault(id) {
    try {
      await api.userAddresses.setDefault(id, user._id);
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a._id === id })));
    } catch (err) { toast.error(err.message); }
  }

  if (loading) return <div className="text-center py-4"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Sổ địa chỉ</h5>
        <button className="btn btn-dark btn-sm rounded-pill" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1"></i>Thêm địa chỉ
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-geo-alt display-4 d-block mb-2"></i>
          Chưa có địa chỉ nào
        </div>
      ) : (
        addresses.map((addr) => {
          const full = [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", ");
          return (
            <div key={addr._id} className="card border-0 shadow-sm rounded-3 mb-2">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div>
                      <span className="fw-semibold">{addr.name}</span>
                      <span className="text-muted small ms-2">{formatPhone(addr.phone)}</span>
                      {addr.is_default && <span className="badge bg-primary rounded-pill ms-2 small">Mặc định</span>}
                    </div>
                    <div className="text-muted small">{full}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0 ms-2">
                    {!addr.is_default && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => handleSetDefault(addr._id)} title="Đặt mặc định">
                        <i className="bi bi-pin"></i>
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(addr)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(addr._id)}><i className="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {showForm && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowForm(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content rounded-4 border-0 shadow">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header border-0 px-4 pt-4">
                    <h5 className="modal-title fw-bold">{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ"}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                  </div>
                  <div className="modal-body px-4">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">Họ tên</label>
                        <input className="form-control form-control-sm rounded-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Số điện thoại</label>
                        <input className="form-control form-control-sm rounded-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Tỉnh/Thành phố</label>
                        <select className="form-select form-select-sm rounded-3" value={form.province} onChange={(e) => handleProvinceChange(e.target.value)} required>
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Quận/Huyện</label>
                        <select className="form-select form-select-sm rounded-3" value={form.district} onChange={(e) => handleDistrictChange(e.target.value)} required disabled={!form.province}>
                          <option value="">Chọn quận/huyện</option>
                          {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Phường/Xã</label>
                        <select className="form-select form-select-sm rounded-3" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} required disabled={!form.district}>
                          <option value="">Chọn phường/xã</option>
                          {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Số nhà, đường</label>
                        <input className="form-control form-control-sm rounded-3" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required placeholder="Số nhà, tên đường..." />
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

      <ConfirmModal
        show={!!deleteTarget}
        title="Xóa địa chỉ"
        message="Bạn có chắc muốn xóa địa chỉ này?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
