import React from "react";
import { Column } from "./types";

interface Props<T> {
  columns: Column<T>[];
}

function DataTableHeader<T>({ columns }: Props<T>) {
  return (
    <thead>
      <tr>
        {columns.map(col => (
          <th
            key={col.key}
            style={{ width: col.width }}
            className={col.sortable ? "sortable" : ""}
          >
            <div className="th-content">
              {col.header}
              {col.sortable && <span className="sort-icon">⇅</span>}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default DataTableHeader;
