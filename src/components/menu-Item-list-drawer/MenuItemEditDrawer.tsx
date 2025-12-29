import React from "react";
import { Form } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import StatusChip from "../../UI/StatusChip/StatusChip";
import EntityEditDrawer from "../EntityEditDrawer";
import { MenuCategory } from "../../types/MenuCategory";
import { MenuItem } from "../../types/MenuItem";

/* ---------------- Validation ---------------- */
const MenuItemSchema = Yup.object({
  name: Yup.string().required("Menu name is required"),
  description: Yup.string().required("Description is required"),
  imageUrl: Yup.string().required("Image URL is required"),
  foodType: Yup.string()
    .trim()
    .min(2, "foodType must be at least 2 characters")
    .required("foodType is required"),
  categoryId: Yup.string()
    .trim()
    .required("categoryId is required"),

  isActive: Yup.boolean().required(),
});


interface MenuItemEditDrawerProps {
  menuItem: MenuItem;
  categories: MenuCategory[];
  onClose: () => void;
  onSubmit: (menuItem: MenuItem) => Promise<void>;
}

const MenuItemEditDrawer: React.FC<MenuItemEditDrawerProps> = ({
  menuItem,
  categories,
  onClose,
  onSubmit,
}) => {
  const isEditMode = Boolean(menuItem?.id);
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: menuItem.name ?? "",
        description: menuItem.description ?? "",
        price: menuItem.price ?? "",
        foodType: menuItem.foodType ?? "",
        imageUrl: menuItem.imageUrl ?? "",
        isActive: menuItem.isActive ?? true,
        categoryId: menuItem.categoryId ?? "",
      }}
      validationSchema={MenuItemSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit({
            ...menuItem,
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
              ? `EDIT MENU: ${values.name}`
              : "ADD MENU"
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
              <Form.Label>Menu Name</Form.Label>
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

            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                disabled={isSubmitting}
                isInvalid={!!touched.categoryId && !!errors.categoryId}
              >
                <option value="">Select Category</option>

                {categories
                  .filter(cat => cat.isActive)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errors.categoryId}
              </Form.Control.Feedback>
            </Form.Group>


            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                value={values.description}
                onChange={handleChange}
                disabled={isSubmitting}
                isInvalid={!!touched.description && !!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                name="imageUrl"
                value={values.imageUrl}
                onChange={handleChange}
                disabled={isSubmitting}
                isInvalid={!!touched.imageUrl && !!errors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control
                name="price"
                value={values.price}
                onChange={handleChange}
                disabled={isSubmitting}
                isInvalid={!!touched.price && !!errors.price}
              />
              <Form.Control.Feedback type="invalid">
                {errors.price}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Food Type</Form.Label>
              <Form.Control
                name="foodType"
                value={values.foodType}
                onChange={handleChange}
                disabled={isSubmitting}
                isInvalid={!!touched.foodType && !!errors.foodType}
              />
              <Form.Control.Feedback type="invalid">
                {errors.foodType}
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

export default MenuItemEditDrawer;
