import React from "react";
import { Column } from "./types";

interface Props<T> {
  row: T;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

function DataTableRow<T>({ row, columns, onRowClick }: Props<T>) {
  return (
    <tr
      className={onRowClick ? "clickable-row" : ""}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map(col => (
        <td key={col.key}>
          {col.render ? col.render(row) : (row as any)[col.key]}
        </td>
      ))}
    </tr>
  );
}

export default DataTableRow;
