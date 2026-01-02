import React from "react";
import StatusChip from "../UI/StatusChip/StatusChip";
// import "./css/EntityViewDrawer.css";

export interface ViewField {
  label: string;
  value?: React.ReactNode;
  status?: "ACTIVE" | "DISABLED" | "OCCUPIED" | "VACANT";
  hidden?: boolean;
}

interface EntityViewDrawerProps {
  title: string;
  icon?: string;
  fields: ViewField[];
  onClose?: () => void;
  footer?: React.ReactNode;
}

const EntityViewDrawer: React.FC<EntityViewDrawerProps> = ({
  title,
  icon = "bi-grid-3x3-gap",
  fields,
  onClose,
  footer,
}) => {
  return (
    <div className="sidebar-wrapper-main">
      <aside className="drawer-root w-100">
        {/* HEADER */}
        <div className="drawer-content p-0">
          <div className="border-bottom d-flex justify-content-between section-title">
            <span>
              <i className={`bi ${icon} me-2`} />
              {title}
            </span>
            <button
              className="btn btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* CONTENT */}
          <div className="drawer-items p-3">
            <div className="order-items-card">
              {fields
                .filter(field => !field.hidden)
                .map((field, index) => (
                  <div
                    key={index}
                    className="table-details__info-row"
                  >
                    <span className="label">{field.label}</span>
                    <span className="value">
                      {field.status && <StatusChip status={field.status} />}

                      {!field.status && field.label === "Image" && typeof field.value === "string" && (
                        <img src={field.value} alt="Image" width={120} height={120}/>
                      )}

                      {!field.status && field.label !== "Image" && field.value}
                    </span>

                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="drawer-footer">
            <div className="drawer-actions p-3">
              {footer}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default EntityViewDrawer;
