import React from "react";
import "./StatusChip.css";

export type StatusType =
  | "open"
  | "cooking"
  | "ready"
  | "completed"
  | "billed"
  | "closed"
  | "cancelled";

interface Props {
  status: StatusType | string;
  size?: "sm" | "md";
}

const StatusChip: React.FC<Props> = ({ status, size = "md" }) => {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();

  return (
    <span
      className={`status-chip status-${normalizedStatus} status-${size}`}
    >
      {normalizedStatus}
    </span>
  );
};

export default StatusChip;
