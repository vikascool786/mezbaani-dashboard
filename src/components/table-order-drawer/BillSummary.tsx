import React from "react";
import "./css/billSummary.css";

interface Bill {
  subtotal: number;
  gst: number;
  gstPercent: number;
  serviceCharge: number;
  total: number;
}

interface Props {
  bill: Bill;
}

const BillSummary: React.FC<Props> = ({ bill }) => {
  return (
    <div className="drawer-section">
      <div className="section-title">BILL SUMMARY</div>

      <div className="bill-card">
        <div className="bill-row">
          <span className="item-name">Items total</span>
          <span>₹{bill.subtotal}</span>
        </div>

        {bill.gst > 0 && (
          <div className="bill-row muted">
            <span className="item-name">GST<span className="gst-percent">({bill.gstPercent}%)</span></span>
            <span>₹{bill.gst}</span>
          </div>
        )}

        {bill.serviceCharge > 0 && (
          <div className="bill-row muted">
            <span className="item-name">Service charge</span>
            <span>₹{bill.serviceCharge}</span>
          </div>
        )}

        <hr className="bill-divider" />

        <div className="bill-row total">
          <span>Estimated bill</span>
          <span>₹{bill.total}</span>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
