import React, { useState } from "react";
import { Button, Row, Col, Badge, Form } from "react-bootstrap";
import CustomCard from "../UI/CustomCard";
import ModalForm from "../UI/ModalForm";
import { FormField } from "../types/FormField";

type TableStatus = "blank" | "running" | "printed" | "paid";

export const TableView: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const handleReservationSubmit = (values: any) => {
    console.log("Reservation Data:", values);
    // later connect API here
  };

  // reservation form fields
  const reservationFields: FormField[] = [
    { name: "guestName", label: "Guest Name", type: "text", required: true },
    { name: "phone", label: "Phone Number", type: "text", required: true },
    { name: "guests", label: "No. of Guests", type: "number", required: true },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: ["AC Hall", "Non-AC", "Rooftop"],
      required: true,
    },
    {
      name: "table",
      label: "Table",
      type: "select",
      options: ["T1", "T2", "T3"],
      required: true,
    },
    { name: "datetime", label: "Date & Time", type: "datetime", required: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="align-items-center border-bottom d-flex justify-content-between mb-3 pb-2">
        <h5 className="fw-bold">Table View</h5>
        <div className="align-items-center d-flex gap-2">
          <i className="bi bi-arrow-repeat fs-2"></i>
          <Button variant="danger">Delivery</Button>
          <Button variant="danger">Take Away</Button>
        </div>
      </div>

      {/* Top action buttons */}
      <div className="align-items-center d-flex flex-wrap gap-2 justify-content-between justify-content-center pb-3">
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={() => setShowModal(true)}>+ Table Reservation</Button>
          <Button variant="danger">+ Contactless</Button>
        </div>
        {/* Legend row */}
        <div className="d-flex flex-wrap gap-4">
          <div>
            <Badge bg="#D3D6D7" text="dark" className="legend-box table-blank me-2 rounded-5">
              &nbsp;
            </Badge>
            Blank Table
          </div>
          <div>
            <Badge bg="#B6E2FA" className="legend-box table-running me-2 rounded-5">
              &nbsp;
            </Badge>
            Running Table
          </div>
          <div>
            <Badge bg="#C5FEBB" className="legend-box table-printed me-2 rounded-5">
              &nbsp;
            </Badge>
            Printed Table
          </div>
          <div>
            <Badge bg="#FBF7A4" className="legend-box table-paid me-2 rounded-5">
              &nbsp;
            </Badge>
            Paid Table
          </div>
        </div>
      </div>


      <div className="d-flex  gap-2 justify-content-between mb-3">
        <div className="d-flex ms-auto">
          <Form>
            <Form.Group className="d-flex align-items-center justify-content-between" controlId="formSelect">
              <Form.Label className="mb-0 pe-3 " style={{ whiteSpace: "nowrap" }}>
                Floor Plan:
              </Form.Label>
              <Form.Select style={{ width: "200px" }}>
                <option value="">Select Layout</option>
                <option value="1">Default Layout</option>
                <option value="2">Tab Layout</option>
              </Form.Select>
            </Form.Group>

          </Form>
        </div>
      </div>


      {/* Sections */}
      <h5 className="fs-5 fw-semibold mb-3 mt-5">A/C</h5>
      <div className="d-flex gap-4 flex-wrap">
        <CustomCard bgColor="#B6E2FA" />
        <CustomCard bgColor="#FBF7A4" />
        <CustomCard bgColor="#B6E2FA" />
      </div>

      <ModalForm
        title="Table Reservation"
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleReservationSubmit}
        fields={reservationFields}
      />
    </div>
  );
};
