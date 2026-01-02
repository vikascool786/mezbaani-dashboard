import React, { useState } from "react";
import { Button, Row, Col, Badge, Form } from "react-bootstrap";
import CustomCard from "../UI/CustomCard";
import ModalForm from "../UI/ModalForm";
import type { Field } from "../../types/form"; // added import and path

type TableStatus = "blank" | "running" | "printed" | "paid";

// reservation form fields
export const reservationFields: Field[] = [
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