import React from "react";
import "./css/orderItemsSkeleton.css";

interface Props {
  rows?: number;
}

const OrderItemsSkeleton: React.FC<Props> = ({ rows = 3 }) => {
  return (
    <div className="drawer-section">
      <div className="order-items-card skeleton-card">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="order-item-row skeleton-row">
            {/* LEFT */}
            <div className="skeleton-left">
              <div className="skeleton-item-name shimmer" />

              <div className="skeleton-actions">
                <div className="skeleton-chip shimmer" />
                <div className="skeleton-chip shimmer" />
                <div className="skeleton-chip shimmer" />
              </div>
            </div>

            {/* RIGHT */}
            <div className="skeleton-right">
              <div className="skeleton-multiplier shimmer" />
              <div className="skeleton-total shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsSkeleton;
