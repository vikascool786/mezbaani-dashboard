// src/components/table-list-drawer/TableViewDrawer.tsx
import React from "react";
import StatusChip from "../../UI/StatusChip/StatusChip";
import { Table } from "../../types/Table";
import "./css/TableViewDrawer.css";
import TableHeader from "../order-drawer/TableHeader";

interface TableViewDrawerProps {
  table: Table;
  onClose?: () => void;
}

const TableViewDrawer: React.FC<TableViewDrawerProps> = ({ table, onClose }) => {
  return (
    <>
      {/* MAIN WRAPPER */}
      <div className="sidebar-wrapper-main">
        <aside className="drawer-root w-100">
          {/* CONTENT */}
          <div className="drawer-content p-0">
            <div className="border-bottom d-flex justify-content-between section-title">
              <span>
                <i className="bi bi-grid-3x3-gap me-2" />
                TABLE DETAILS
              </span>
              <div className="btn btn-close" onClick={onClose}
                aria-label="Close">
              </div>
            </div>

            <div className="drawer-items p-3">
              {/* BASIC INFO */}
              <div className="order-items-card">
                <div className="table-details__info-row">
                  <span className="label">Table Name</span>
                  <span className="value">{table.name}</span>
                </div>

                <div className="table-details__info-row">
                  <span className="label">Section</span>
                  <span className="value">{table.section}</span>
                </div>

                <div className="table-details__info-row">
                  <span className="label">Seats</span>
                  <span className="value">{table.seats}</span>
                </div>

                <div className="table-details__info-row">
                  <span className="label">Occupied</span>
                  <StatusChip
                    status={table.isOccupied ? "OCCUPIED" : "VACANT"}
                  />
                </div>

                {/* OPTIONAL */}
                {"isActive" in table && (
                  <div className="table-details__info-row">
                    <span className="label">Status</span>
                    <StatusChip
                      status={table.isActive ? "ACTIVE" : "DISABLED"}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="drawer-footer">
            <div className="drawer-actions p-3">
              <div className="action-grid d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  disabled
                >
                  <i className="bi bi-pencil-square me-2" />
                  Edit from Actions
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default TableViewDrawer;
