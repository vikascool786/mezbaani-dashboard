import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export type ActionType =
  | "view"
  | "edit"
  | "delete"
  | "print"
  | "disable"
  | "enable";

export interface ActionConfig {
  type: ActionType;
  label: string;
  onClick: (id: string) => void;
  visible?: boolean; // default true
  disabled?: boolean;
}

interface DrawerActionsProps {
  entity: {
    id: string;
  };
  actions: ActionConfig[];
}

const ACTION_ICON_MAP: Record<ActionType, string> = {
  view: "bi-eye text-dark-emphasis",
  edit: "bi-pencil-square text-dark-emphasis",
  delete: "bi-trash3 text-danger",
  print: "bi-printer text-dark-emphasis",
  disable: "bi-slash-circle text-warning",
  enable: "bi-check-circle text-success",
};

const DrawerActions: React.FC<DrawerActionsProps> = ({
  entity,
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
            <span>
              <i
                className={`bi ${ACTION_ICON_MAP[action.type]} fs-5 cursor-pointer ${
                  action.disabled ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() =>
                  !action.disabled && action.onClick(entity.id)
                }
              />
            </span>
          </OverlayTrigger>
        ))}
    </div>
  );
};

export default DrawerActions;
