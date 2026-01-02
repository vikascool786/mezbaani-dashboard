export type FieldType = "text" | "number" | "select" | "datetime" | "textarea";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // present when type === 'select'
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "datetime" | "email" | "phone";
  required?: boolean;
  options?: string[];
}