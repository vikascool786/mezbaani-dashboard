import React from "react";
import CustomTable, { SortConfig } from "../UI/Table/CustomTable";

const sampleOrders = [
  { id: "ORD-001", customer: "Alice Johnson", total: 42.5, status: "Pending" },
  { id: "ORD-002", customer: "Bob Smith", total: 120.0, status: "Shipped" },
  { id: "ORD-003", customer: "Charlie Lee", total: 75.0, status: "Delivered" },
  { id: "ORD-004", customer: "Diana Prince", total: 250.99, status: "Cancelled" },
  { id: "ORD-005", customer: "Evan Wright", total: 19.99, status: "Pending" },
  { id: "ORD-006", customer: "Fiona Green", total: 89.5, status: "Delivered" },
  { id: "ORD-007", customer: "George Hall", total: 60.0, status: "Shipped" },
  { id: "ORD-008", customer: "Helen Brown", total: 300.0, status: "Pending" },
];

const mockFetchOrders = (
  page: number,
  pageSize: number,
  search?: string,
  sortConfig?: SortConfig
): Promise<{ data: Record<string, any>[]; total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...sampleOrders];

      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredData = filteredData.filter(
          (order) =>
            order.customer.toLowerCase().includes(lowerSearch) ||
            order.status.toLowerCase().includes(lowerSearch) ||
            order.id.toLowerCase().includes(lowerSearch)
        );
      }

      if (sortConfig && sortConfig.key) {
        filteredData.sort((a, b) => {
          const aValue = a[sortConfig.key as keyof typeof a];
          const bValue = b[sortConfig.key as keyof typeof b];

          if (typeof aValue === "string" && typeof bValue === "string") {
            if (sortConfig.direction === "asc") {
              return aValue.localeCompare(bValue);
            } else {
              return bValue.localeCompare(aValue);
            }
          } else if (typeof aValue === "number" && typeof bValue === "number") {
            if (sortConfig.direction === "asc") {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          }
          return 0;
        });
      }

      const total = filteredData.length;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredData.slice(start, end);

      resolve({ data: paginatedData, total });
    }, 500); // simulate 500ms network delay
  });
};

const Orders: React.FC = () => {
  return (
    <div className="container-fluid">
      <h3 className="mb-3">Orders</h3>
      <CustomTable
        headers={[
          { key: "id", label: "Order ID" },
          { key: "customer", label: "Customer" },
          { key: "total", label: "Total (₹)" },
          { key: "status", label: "Status" }
        ]}
        data={[]}
        isSortable={true}
        onHandleClick={(row: any) => console.log("Clicked row:", row)}
        buttonLabel="View"
        fetchData={mockFetchOrders}
        pageSize={5}
      />
    </div>
  );
};

export default Orders;