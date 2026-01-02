// src/components/OrderActions.tsx
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export type OrderActionType =
  | "view"
  | "edit"
  | "delete"
  | "print";

export interface OrderActionConfig {
  type: OrderActionType;
  label: string;
  onClick: (id: string) => void;
  visible?: boolean; // default true
}

interface OrderActionsProps {
  order: {
    id: string;
    status: string;
  };
  actions: OrderActionConfig[];
}

const ACTION_ICON_MAP: Record<OrderActionType, string> = {
  view: "bi-eye text-dark-emphasis",
  edit: "bi-pencil-square text-dark-emphasis",
  delete: "bi-trash3 text-dark-emphasis",
  print: "bi-printer text-dark-emphasis",
};

const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  actions,
}) => {
  return (
    <div className="d-flex gap-3 justify-content-end align-items-center">
      {actions
        .filter(action => action.visible !== false)
        .map(action => (
          <OverlayTrigger
            key={action.type}
            placement="top"
            overlay={<Tooltip>{action.label}</Tooltip>}
          >
            <i
              className={`bi ${ACTION_ICON_MAP[action.type]} fs-5 cursor-pointer`}
              onClick={() => action.onClick(order.id)}
            />
          </OverlayTrigger>
        ))}
    </div>
  )
};

export default OrderActions;
