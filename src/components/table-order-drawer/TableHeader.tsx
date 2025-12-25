import React from "react";
import { Badge } from "react-bootstrap";
import { Order } from "../../types/Order";
import { getElapsedTime } from "../../utils/time";
import "./css/TableHeader.css";

interface Props {
  table: {
    name: string;
    seats: number;
  };
  order: Order | null;
  onClose: () => void;
  showCloseBill?: boolean;
}

const statusMap = {
  OPEN: { label: "In Dining", className: "dining" },
  CLOSED: { label: "Billed", className: "billed" },
  CANCELLED: { label: "Cancelled", className: "cancelled" },
};

const TableHeader: React.FC<Props> = ({ table, order, onClose, showCloseBill }) => {
  // ✅ NULL STATE (very important)
  if (!order) {
    return (
      <div className="table-header-drawer py-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{table.name}</h5>
        </div>

        <div className="text-muted small mt-2">
          No active order
        </div>
      </div>
    );
  }

  // ✅ SAFE TO ACCESS order BELOW THIS LINE
  const elapsed = getElapsedTime(order.openedAt);
  const status = statusMap[order.status];

  return (
    <div className="table-header-drawer">
      {/* Top row */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="align-items-center d-flex gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <div>
            {showCloseBill ? (
              <h5 className="mb-1 fw-bold">
                Close Bill For {table.name}
                <span className="text-muted fw-normal ms-2 gst-percent">
                  ({table.seats} covers)
                </span>
              </h5>

            ) : (
              <h5 className="mb-1 fw-bold">
                {table.name}
                <span className="text-muted fw-normal ms-2 gst-percent">
                  ({table.seats} covers)
                </span>
              </h5>

            )}

            <div className="text-muted small">
              <strong>Guests:</strong> 3 - <strong>Server:</strong> Vikas - <strong>Running</strong> ₹{Number(order.total).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="header-elapsed">
          <div className="header-elapsed-timer">
            <i className="bi bi-clock me-2" />
            Elapsed: {elapsed}
          </div>
          <div className="guest-type">
            <i className="bi bi-people me-1" />
            Family
          </div>
          <Badge className={`table-header-drawer-status-pill ${status.className}`}>
            <span className="dot" />
            {status.label}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
