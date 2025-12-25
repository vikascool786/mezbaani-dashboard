import React from "react";
import { Form } from "react-bootstrap";

export interface SelectOption {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  label?: string;
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  options,
  placeholder = "Select",
  disabled = false,
  onChange,
}) => {
  return (
    <Form.Group>
      {label && <Form.Label className="fw-semibold">{label}</Form.Label>}

      <Form.Select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default DropdownSelect;
