"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AddressModal({ show, userId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", phone: "", province: "", district: "", ward: "", street: "" });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v1/?depth=1").then((r) => r.json()).then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (show) setForm({ name: "", phone: "", province: "", district: "", ward: "", street: "" });
  }, [show]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.province || !form.district || !form.ward || !form.street) {
      toast.error("Vui lòng điền đầy đủ địa chỉ"); return;
    }
    setSaving(true);
    try {
      const newAddr = await api.userAddresses.create({
        name: form.name,
        phone: form.phone,
        province: getProvinceName(form.province),
        district: getDistrictName(form.district),
        ward: getWardName(form.ward),
        street: form.street,
        user_id: userId,
      });
      toast.success("Đã thêm địa chỉ");
      onCreated?.(newAddr);
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content rounded-4 border-0 shadow">
            <form onSubmit={handleSubmit}>
              <div className="modal-header border-0 px-4 pt-4">
                <h5 className="modal-title fw-bold">Thêm địa chỉ mới</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>
              <div className="modal-body px-4">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label small">Họ tên</label>
                    <input className="form-control form-control-sm rounded-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">SĐT</label>
                    <input className="form-control form-control-sm rounded-3" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small">Tỉnh/TP</label>
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
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Hủy</button>
                <button type="submit" className="btn btn-dark rounded-pill px-4" disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
