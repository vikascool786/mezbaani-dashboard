// src/components/table-list-drawer/TableEditDrawer.tsx
import React from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { Formik } from "formik";
import * as Yup from "yup";

import StatusChip from "../../UI/StatusChip/StatusChip";
import { Table } from "../../types/Table";
import "./css/TableEditDrawer.css";

interface TableEditDrawerProps {
  table: Table;
  onClose: () => void;
  onUpdate: (table: Table) => Promise<void>;
}

/* ---------------- Validation ---------------- */
const TableSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Table name must be at least 2 characters")
    .required("Table name is required"),

  seats: Yup.number()
    .min(1, "Seats must be at least 1")
    .required("Seats are required"),

  section: Yup.string()
    .trim()
    .required("Section is required"),
});

const TableEditDrawer: React.FC<TableEditDrawerProps> = ({
  table,
  onClose,
  onUpdate,
}) => {
  const isEditMode = Boolean(table?.id);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...table,
        seats: table.seats ?? 1,
        name: table.name ?? "",
        section: table.section ?? "",
      }}
      validationSchema={TableSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onUpdate({
            ...table,
            ...values,
            seats: Number(values.seats),
          });
          onClose();
        } catch {
          toast.error("Failed to update table");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting,
      }) => (
        <div className="sidebar-wrapper-main">
          <aside className="drawer-root w-100">
            {/* HEADER */}
            <div className="drawer-content p-0">
              <div className="border-bottom d-flex justify-content-between section-title">
                <span>
                  <i className="bi bi-pencil-square me-2" />
                  {values.name
                    ? `EDIT TABLE: ${values.name}`
                    : "ADD TABLE"}
                </span>
                <button
                  className="btn btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              {/* BODY */}
              <div className="drawer-items p-3">
                <div className="order-items-card">
                  {/* STATUS ROW */}
                  <div className="table-details__info-row mb-3">
                    <span className="label">Current Status</span>
                    <StatusChip
                      status={table.isOccupied ? "ACTIVE" : "DISABLED"}
                    />
                  </div>

                  <Form className="d-flex flex-column gap-3" noValidate>
                    {/* Table Name */}
                    <Form.Group>
                      <Form.Label>Table Name</Form.Label>
                      <Form.Control
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        isInvalid={!!touched.name && !!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Seats */}
                    <Form.Group>
                      <Form.Label>Seats</Form.Label>
                      <Form.Control
                        type="number"
                        name="seats"
                        value={values.seats}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        min={1}
                        isInvalid={!!touched.seats && !!errors.seats}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.seats}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Section */}
                    <Form.Group>
                      <Form.Label>Section</Form.Label>
                      <Form.Control
                        name="section"
                        value={values.section}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        isInvalid={!!touched.section && !!errors.section}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.section}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form>
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
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-check-circle me-2" />
                    {isEditMode ? "Update Table" : "Add Table"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </Formik>
  );
};

export default TableEditDrawer;
