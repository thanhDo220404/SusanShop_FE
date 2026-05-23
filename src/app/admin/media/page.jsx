/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import ConfirmModal from "../components/ConfirmModal";

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadFolder, setUploadFolder] = useState("susan_shop");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ alt_text: "", title: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);
  const [filter, setFilter] = useState("");

  async function fetchItems() {
    try {
      setLoading(true);
      const data = await api.media.getAll();
      setItems(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const folder = uploadFolder.trim() || "susan_shop";
      if (selectedFiles.length === 1) {
        await api.media.uploadSingle(selectedFiles[0], folder);
      } else {
        await api.media.uploadMultiple(selectedFiles, folder);
      }
      setSelectedFiles([]);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  function openEdit(item) {
    setForm({ alt_text: item.alt_text || "", title: item.title || "" });
    setEditingId(item._id);
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.media.update(editingId, form);
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
      await api.media.delete(deleteTarget._id);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err) {
      alert(err.message);
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const filteredItems = filter
    ? items.filter(
        (item) =>
          (item.original_filename || "")
            .toLowerCase()
            .includes(filter.toLowerCase()) ||
          (item.alt_text || "").toLowerCase().includes(filter.toLowerCase()) ||
          (item.title || "").toLowerCase().includes(filter.toLowerCase()),
      )
    : items;

  if (loading) {
    return <div className="spinner-border text-primary" role="status" />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Media</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <i className="bi bi-cloud-upload"></i> Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {selectedFiles.length > 0 && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">
              {selectedFiles.length} file(s) selected
            </h6>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-center gap-1 border rounded px-2 py-1"
                >
                  <span className="small">{file.name}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-sm"
                    style={{ fontSize: "0.5rem" }}
                    onClick={() => removeFile(idx)}
                  ></button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Folder</label>
              <input
                className="form-control form-control-sm"
                placeholder="susan_shop"
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
              />
              <div className="form-text small">Để trống mặc định là &quot;susan_shop&quot;</div>
            </div>
            <button
              className="btn btn-success"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length} file(s)`}
            </button>
          </div>
        </div>
      )}

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search by filename, alt text or title..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="row g-3">
        {filteredItems.length === 0 && (
          <div className="col-12 text-center text-muted py-4">
            {filter ? "No matching media" : "No media uploaded"}
          </div>
        )}
        {filteredItems.map((item) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={item._id}>
            <div className="card shadow-sm h-100">
              <img
                src={item.url || item.secure_url}
                alt={item.alt_text || item.original_filename}
                className="card-img-top"
                style={{ height: 180, objectFit: "cover" }}
              />
              <div className="card-body p-2">
                <p className="card-text small mb-1 text-truncate">
                  <strong>{item.original_filename}</strong>
                </p>
                <p className="card-text small text-muted mb-1">
                  {item.width} x {item.height} &middot;{" "}
                  {item.format?.toUpperCase()} &middot;{" "}
                  {formatBytes(item.bytes)}
                </p>
                {item.alt_text && (
                  <p className="small text-muted mb-1">Alt: {item.alt_text}</p>
                )}
                <p className="small text-muted mb-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-outline-primary flex-grow-1"
                    onClick={() => openEdit(item)}
                  >
                    <i className="bi bi-pencil"></i> Edit Meta
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Media Metadata</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Alt Text</label>
                      <input
                        className="form-control"
                        value={form.alt_text}
                        onChange={(e) =>
                          setForm({ ...form, alt_text: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      />
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
        title="Delete Media"
        message={`Delete "${deleteTarget?.original_filename}"? This will also remove it from Cloudinary.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
