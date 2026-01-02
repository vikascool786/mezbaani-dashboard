import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FieldConfig } from "../types/FormField";
import './Modal.css';

interface ModalFormProps {
  title: string;
  show: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  fields: FieldConfig[];
}

// 🔹 Validation Schema Builder
const getValidationSchema = (fields: FieldConfig[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((f) => {
    let validator: any = Yup.string();

    if (f.required) {
      validator = validator.required(`${f.label} is required`);
    }

    if (f.type === "email" || f.name.toLowerCase().includes("email")) {
      validator = validator.email("Invalid email format");
    }

    if (f.type === "phone" || f.name.toLowerCase().includes("phone")) {
      validator = Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .required(`${f.label} is required`);
    }

    shape[f.name] = validator;
  });

  return Yup.object().shape(shape);
};

// 🔹 Helper: get current date-time in YYYY-MM-DDTHH:mm
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ModalForm: React.FC<ModalFormProps> = ({
  title,
  show,
  onClose,
  onSubmit,
  fields,
}) => {
  const initialValues: any = {};
  fields.forEach((f) => {
    initialValues[f.name] = f.type === "datetime" ? getCurrentDateTime() : "";
  });

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
      dialogClassName="modal-custom"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={initialValues}
        validationSchema={getValidationSchema(fields)}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
          onClose();
        }}
      >
        {({ isSubmitting }) => (
          <FormikForm>
            <Modal.Body className="p-4">
              <Row className="g-3">
                {fields.map((field) => (
                  <Col xs={12} md={field.type === "textarea" ? 12 : 6} key={field.name}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">{field.label}</Form.Label>
                      {field.type === "textarea" ? (
                        <Field
                          as="textarea"
                          name={field.name}
                          className="form-control"
                          rows={3}
                        />
                      ) : field.type === "select" ? (
                        <Field as="select" name={field.name} className="form-select">
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Field>
                      ) : (
                        <Field
                          type={
                            field.type === "datetime"
                              ? "datetime-local"
                              : field.type === "phone"
                              ? "text"
                              : field.type
                          }
                          name={field.name}
                          className="form-control"
                          min={field.type === "datetime" ? getCurrentDateTime() : undefined}
                        />
                      )}
                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 justify-content-end px-4 pb-4">
              <Button variant="outline-secondary" onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Save
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalForm;
