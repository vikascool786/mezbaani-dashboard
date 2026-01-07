import React from "react";
import { Form } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StatusChip from "../../UI/StatusChip/StatusChip";
import EntityEditDrawer from "../EntityEditDrawer";
import { MenuCategory } from "../../types/MenuCategory";

/* ---------------- Validation ---------------- */
const MenuCategorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .required("Category name is required"),

  isActive: Yup.boolean().required(),
});


interface MenuCategoryEditDrawerProps {
  category: MenuCategory;
  onClose: () => void;
  onSubmit: (category: MenuCategory) => Promise<void>;
}

const MenuCategoryEditDrawer: React.FC<MenuCategoryEditDrawerProps> = ({
  category,
  onClose,
  onSubmit,
}) => {
  const isEditMode = Boolean(category?.id);
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: category.name ?? "",
        isActive: category.isActive ?? true,
      }}
      validationSchema={MenuCategorySchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit({
            ...category,
            ...values,
          });
          onClose();
        } catch {
          toast.error("Failed to save category");
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
        <EntityEditDrawer
          title={
            isEditMode
              ? `EDIT CATEGORY: ${values.name}`
              : "ADD CATEGORY"
          }
          icon="bi-tags"
          onClose={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? "Update Category" : "Add Category"}
        >
          {/* STATUS */}
          {isEditMode && (
            <div className="table-details__info-row mb-3">
              <span className="label">Current Status</span>
              <StatusChip
                status={values.isActive ? "ACTIVE" : "DISABLED"}
              />
            </div>
          )}

          <Form className="d-flex flex-column gap-3" noValidate>
            {/* Category Name */}
            <Form.Group>
              <Form.Label>Category Name</Form.Label>
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

            {/* Active Toggle */}
            <Form.Group className="d-flex align-items-center justify-content-between">
              <div>
                <Form.Label className="mb-0">Status</Form.Label>
                <div className="text-muted small">
                  Enable or disable this category
                </div>
              </div>

              <Form.Check
                type="switch"
                id="isActive"
                name="isActive"
                checked={values.isActive}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Form.Group>
          </Form>

        </EntityEditDrawer>
      )}
    </Formik>
  );
};

export default MenuCategoryEditDrawer;
