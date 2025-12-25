import React from "react";
import "./css/orderItems.css";
import { OrderItem } from "../../types/Order";

interface Props {
  items: OrderItem[];
  draftItems?: boolean;
}

const OrderItems: React.FC<Props> = ({ items, draftItems }) => {
  if (!items.length) {
    return (
      <div className="drawer-section">
        <div className="text-muted text-center py-4">
          No items added yet
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-section">
      <div className="order-items-card">
        {items.map((item) => {
          const effectiveQty =
            item.quantity - item.quantityCancelled;
          const total = item.quantity;
          const served = item.quantityServed || 0;
          const cancelled = item.quantityCancelled || 0;
          const cooking = total - served - cancelled;

          return (
            <div key={item.menuItemId} className="order-item-row">
              <div>
                <div className="item-name">{item.name}</div>

                <div className="item-status-chips">
                  {served > 0 && !draftItems && (
                    <span className="chip chip-served">
                      Served {served > 1 && `(${served})`}
                    </span>
                  )}

                  {cooking > 0 && !draftItems && (
                    <span className="chip chip-cooking">
                      Cooking {cooking > 1 && `(${cooking})`}
                    </span>
                  )}

                  {cancelled > 0 && !draftItems && (
                    <span className="chip chip-cancelled">
                      Cancelled {cancelled > 1 && `(${cancelled})`}
                    </span>
                  )}

                  {cooking > 0 && draftItems && (
                    <span className="chip chip-cooking">
                      Ready to KOT {cooking > 1 && `(${cooking})`}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-end">
                <div className="item-multiplier">
                  {effectiveQty} × ₹{item.price}
                </div>
                <div className="item-total">
                  ₹{effectiveQty * item.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItems;
