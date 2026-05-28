"use client";
import { useState } from "react";

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel} />
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-body text-center p-4">
              <h6 className="fw-bold mb-2">{title}</h6>
              <p className="text-muted small mb-3">{message}</p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-light rounded-pill px-4" onClick={onCancel}>Hủy</button>
                <button className="btn btn-dark rounded-pill px-4" onClick={onConfirm}>Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
