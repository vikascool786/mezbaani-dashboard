import React from "react";

interface EntityEditDrawerProps {
  title: string;
  icon?: string;
  onClose: () => void;
  isSubmitting?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  children: React.ReactNode;
}

const EntityEditDrawer: React.FC<EntityEditDrawerProps> = ({
  title,
  icon = "bi-pencil-square",
  onClose,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  children,
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
              disabled={isSubmitting}
            />
          </div>

          {/* BODY */}
          <div className="drawer-items p-3">
            <div className="order-items-card">
              {children}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="drawer-footer">
          <div className="drawer-actions p-3">
            <div className="action-grid d-flex gap-3">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary w-100"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                <i className="bi bi-check-circle me-2" />
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default EntityEditDrawer;
