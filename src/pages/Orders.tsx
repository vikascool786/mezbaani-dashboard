import React from "react";
import CustomTable from "../UI/Table/CustomTable";

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
        data={sampleOrders}
        isSortable={true}
        onHandleClick={(row: any) => console.log("Clicked row:", row)}
        buttonLabel="View"
      />
    </div>
  );
};

export default Orders;