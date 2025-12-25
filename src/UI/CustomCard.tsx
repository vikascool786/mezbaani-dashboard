import React from "react";
import { Card } from "react-bootstrap";
import "./CustomCard.css";

interface CustomCardProps {
  status: "VACANT" | "OCCUPIED" | "BILLED" | "RESERVED";
  tableName: string;
  seats: string;
  duration?: string;          // 24 min, 1h 12m
  customerName?: string;
  amount?: number;
  reservationTime?: string;

  onClick?: () => void;
}


const CustomCard: React.FC<CustomCardProps> = ({
  status,
  tableName,
  seats,
  duration,
  customerName,
  amount,
  reservationTime,
  onClick,
}) => {
  return (
    <Card className={`table-card ${status.toLowerCase()}`} onClick={onClick}>

      {/* STATUS BADGE */}
      <div className={`status-pill ${status.toLowerCase()}`}>
        {status}
      </div>

      {/* HEADER */}
      <div className="table-header">
        <span className="table-name">{tableName}</span>
        <span className="table-seats">
          <i className="bi bi-people" /> {seats}
        </span>
      </div>

      {/* BODY */}
      <div className="table-body">
        {status === "VACANT" && <span className="available-text">Available</span>}

        {duration && status !== "VACANT" && !reservationTime && (
          <span className={`time-chip ${status.toLowerCase()}`}>
            {duration}
          </span>
        )}

        {reservationTime && status !== "VACANT" && (
          <span className="reservation-time">{reservationTime}</span>
        )}
      </div>

      {/* FOOTER */}
      {customerName && status !== "VACANT" && (
        <div className="table-footer">
          <span className="customer-name">{customerName}</span>
          {amount && <span className="amount">₹{amount}</span>}
        </div>
      )}

    </Card>
  );
};

export default CustomCard;
