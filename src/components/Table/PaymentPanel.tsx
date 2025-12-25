import React, { useState } from "react";
import "./PaymentPanel.css";

interface Props {
    isOpen: boolean;
    totalAmount: number;
    onBack?: () => void;
    selectedMethod: "cash" | "upi" | "card" | null;
    setSelectedMethod: React.Dispatch<React.SetStateAction<"cash" | "upi" | "card" | null>>;
}

const PaymentPanel: React.FC<Props> = ({
    isOpen,
    totalAmount,
    onBack,
    selectedMethod,
    setSelectedMethod
}) => {


    if (!isOpen) return null;

    return (
        <aside className="drawer-root payment-left-panel">
            {/* HEADER */}
            <div className="payment-header">
                <h6>Payment</h6>
                <span className="payment-subtitle">Select payment method</span>
            </div>

            {/* BODY */}
            <div className="payment-wrapper">
                {/* PAYMENT METHODS */}
                <div className="payment-methods">
                    <div
                        className={`payment-method-card ${selectedMethod === "cash" ? "active" : ""
                            }`}
                        onClick={() => setSelectedMethod("cash")}
                    >
                        <div className="method-icon">💵</div>
                        <div className="method-info">
                            <div className="method-title">Cash</div>
                            <div className="method-desc">Receive cash from customer</div>
                        </div>
                    </div>

                    <div
                        className={`payment-method-card ${selectedMethod === "upi" ? "active" : ""
                            }`}
                        onClick={() => setSelectedMethod("upi")}
                    >
                        <div className="method-icon">📱</div>
                        <div className="method-info">
                            <div className="method-title">UPI / Google Pay</div>
                            <div className="method-desc">Scan QR to pay</div>
                        </div>
                    </div>

                    <div
                        className={`payment-method-card ${selectedMethod === "card" ? "active" : ""
                            }`}
                        onClick={() => setSelectedMethod("card")}
                    >
                        <div className="method-icon">📞</div>
                        <div className="method-info">
                            <div className="method-title">Pay Later</div>
                            <div className="method-desc">Phone / credit settlement</div>
                        </div>
                    </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div className="payment-summary">
                    <div className="summary-row">
                        <span>Total Payable</span>
                        <span className="summary-amount">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="payment-footer">
                {onBack && (
                    <button className="btn btn-outline-secondary w-100 mb-2" onClick={onBack}>
                        ← Back to Order
                    </button>
                )}
            </div>
        </aside>
    );
};

export default PaymentPanel;
