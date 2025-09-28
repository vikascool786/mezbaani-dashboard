import React from "react";
import { Card, Table } from "react-bootstrap";

const sampleOrders = [
  { id: "ORD-001", customer: "Alice", total: 42.5, status: "Pending" },
  { id: "ORD-002", customer: "Bob", total: 120, status: "Shipped" },
  { id: "ORD-003", customer: "Charlie", total: 75, status: "Delivered" },
];

const Orders: React.FC = () => {
  return (
    <div className="container-fluid">
      <h3 className="mb-3">Orders</h3>
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>${o.total}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Orders;