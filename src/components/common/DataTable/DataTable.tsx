import React from "react";
import DataTableHeader from "./DataTableHeader";
import DataTableRow from "./DataTableRow";
import { Column } from "./types";
import "./DataTable.css";
import DataTablePagination from "./DataTablePagination";

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  onRowClick?: (row: T) => void;
  // ✅ pagination
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

function DataTable<T>({
  columns,
  data,
  emptyText,
  onRowClick,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}: Props<T>) {

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <DataTableHeader columns={columns} />

        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                {emptyText || "No records found"}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <DataTableRow
                key={index}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))
          )}
        </tbody>
      </table>
      {onPageChange && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default DataTable;
