import React from "react";
import "./css/orderItems.css";
import { Order, OrderItem } from "../../types/Order";

interface Props {
  items: OrderItem[];
  orderDetails?: any;
  draftItems?: boolean;
  // onServeItem?: (orderId: string, itemId: string, qty?: number) => void;
  // onCancelItem?: (orderId: string, itemId: string, qty?: number) => void;
  onItemAction?: (
    orderId: string,
    itemId: string,
    action: "served" | "cancelled",
    qty?: number
  ) => void;
}

const OrderItems: React.FC<Props> = ({ items, orderDetails, draftItems, onItemAction }) => {

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

                <div className="item-status-actions">
                  {/* 🟡 COOKING */}
                  {!draftItems && (
                    <button
                      className="chip chip-cooking"
                      disabled={cooking <= 0}
                    >
                      Cooking ({cooking})
                    </button>
                  )}

                  {/* 🟢 SERVE */}
                  {!draftItems && (
                    <button
                      className="chip chip-served clickable"
                      disabled={cooking <= 0}
                      onClick={() =>
                        onItemAction?.(
                          orderDetails!.id,
                          item.menuItemId,
                          "served",
                          1
                        )
                      }
                    >
                      Serve ({served})
                    </button>
                  )}

                  {/* 🔴 CANCEL */}
                  {!draftItems && (
                    <button
                      className="chip chip-cancelled clickable"
                      disabled={cooking <= 0}
                      onClick={() =>
                        onItemAction?.(
                          orderDetails!.id,
                          item.menuItemId,
                          "cancelled",
                          1
                        )
                      }
                    >
                      Cancel ({cancelled})
                    </button>
                  )}

                  {/* 🟡 DRAFT MODE */}
                  {draftItems && (
                    <span className="chip chip-cooking">
                      Ready to KOT ({total})
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
