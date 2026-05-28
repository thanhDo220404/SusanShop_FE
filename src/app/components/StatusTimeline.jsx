"use client";

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", icon: "bi-hourglass-split", color: "#f59e0b" },
  confirmed: { label: "Đã xác nhận", icon: "bi-check-circle", color: "#3b82f6" },
  shipping: { label: "Đang giao", icon: "bi-truck", color: "#8b5cf6" },
  delivered: { label: "Đã giao", icon: "bi-box-seam", color: "#10b981" },
  cancelled: { label: "Đã hủy", icon: "bi-x-circle", color: "#ef4444" },
};

const ORDER = ["pending", "confirmed", "shipping", "delivered"];

export default function StatusTimeline({ currentStatus, history = [] }) {
  const historyMap = {};
  for (const h of history || []) {
    historyMap[h.status] = h.changed_at;
  }
  const isCancelled = currentStatus === "cancelled";
  const currentIdx = ORDER.indexOf(currentStatus);
  const doneIdx = isCancelled ? -1 : currentIdx;

  return (
    <div className="d-flex align-items-start" style={{ gap: 0 }}>
      {ORDER.map((status, idx) => {
        const s = STATUS_MAP[status];
        const hasDate = historyMap[status];
        const isDone = idx <= doneIdx;
        const isCurrent = status === currentStatus;

        return (
          <div key={status} className="d-flex align-items-start" style={{ flex: 1, gap: 0 }}>
            <div className="text-center" style={{ flex: 1 }}>
              <div
                className="d-flex align-items-center justify-content-center mx-auto rounded-circle"
                style={{
                  width: 38,
                  height: 38,
                  background: isDone || isCurrent ? s.color : "#f3f4f6",
                  boxShadow: isDone || isCurrent ? `0 0 0 4px ${s.color}22` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <i className={`bi ${s.icon} ${isDone || isCurrent ? "text-white" : "text-muted"}`} style={{ fontSize: "0.9rem" }} />
              </div>
              <div className="small mt-2 fw-semibold text-center" style={{ fontSize: "0.675rem", color: isDone || isCurrent ? s.color : "#9ca3af", lineHeight: 1.2 }}>
                {s.label}
              </div>
              {hasDate && (
                <div className="text-muted text-center" style={{ fontSize: "0.6rem" }}>
                  {new Date(hasDate).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            {idx < ORDER.length - 1 && (
              <div
                className="flex-grow-1 align-self-center"
                style={{
                  height: 3,
                  minWidth: 16,
                  background: isDone && !isCancelled
                    ? `linear-gradient(90deg, ${s.color}, ${STATUS_MAP[ORDER[idx + 1]].color})`
                    : "#e5e7eb",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}

      {isCancelled && (
        <div className="text-center" style={{ flex: 1 }}>
          <div
            className="d-flex align-items-center justify-content-center mx-auto rounded-circle"
            style={{
              width: 38,
              height: 38,
              background: "#ef4444",
              boxShadow: "0 0 0 4px #ef444422",
            }}
          >
            <i className="bi bi-x-circle text-white" style={{ fontSize: "0.9rem" }} />
          </div>
          <div className="small mt-2 fw-semibold text-danger text-center" style={{ fontSize: "0.675rem" }}>Đã hủy</div>
          {historyMap.cancelled && (
            <div className="text-muted text-center" style={{ fontSize: "0.6rem" }}>
              {new Date(historyMap.cancelled).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
