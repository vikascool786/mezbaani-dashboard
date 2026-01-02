import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../components/common/DataTable/DataTable";
import { Column } from "../components/common/DataTable/types";
import { Button } from "react-bootstrap";
import { Order } from "../types/Order";
import { useApi } from "../hooks/useApi";
import StatusChip from "../UI/StatusChip/StatusChip";
import { getElapsedTime } from "../utils/time";
import OrderActions from "../components/table-order-drawer/OrderActions";
import RightSidebar from "../components/sidebar/RightSidebar";
import OrderDetailDrawer from "../components/order-drawer/OrderDetailDrawer";

const Orders: React.FC = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const { apiCall } = useApi();

  // Pagination state
  const [page, setPage] = useState(1);

  //open right sidebar
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setSelectedOrder(order);
    setIsRightSidebarOpen(true);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await apiCall(
        `${baseUrl}/orders`
      );
      setOrders(res);
    };

    fetchOrders();
  }, []);

  /* 🔍 Search (local for now) */
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;

    const term = search.toLowerCase();
    return orders.filter(
      o =>
        o.id.toLowerCase().includes(term) ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.status.toLowerCase().includes(term)
    );
  }, [orders, search]);

  /* -----------------------
   Table Columns
  ----------------------- */

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: "Order ID",
      sortable: true,
      render: row => <strong>#{row.orderNumber}</strong>,
    },
    {
      key: "table",
      header: "Table/Type",
      sortable: true,
      render: row => (
        <div>
          <strong>{row.Table?.name ?? "-"}</strong>
          <div className="text-muted small">
            {row.Table?.section}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      render: row => `₹${row.total}`,
    },
    {
      key: "status",
      header: "Status",
      render: row => <StatusChip status={row.status} />
    },
    {
      key: "createdAt",
      header: "Time",
      render: row => (
        <span className="text-muted">
          {getElapsedTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: "user",
      header: "Server",
      render: row => (
        <div>
          <strong>{row.user?.name ?? "-"}</strong>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: row => (
        <OrderActions
          order={row}
          actions={[
            {
              type: "view",
              label: "View Order",
              onClick: handleViewOrder,
            },
            {
              type: "print",
              label: "Print Bill",
              visible: ["READY", "PAID", "CLOSED"].includes(row.status),
              onClick: () => { console.log("Print bill for order:", row.id) }
            },
          ]}
        />
      ),
    }

  ];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
        <h5 className="fw-bold mb-0">Order Management</h5>

        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" size="sm">
            <i className="bi bi-arrow-repeat" />
          </Button>
          <Button variant="danger" size="sm">
            Add Order
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-3 w-25">
        <input
          type="text"
          className="form-control"
          placeholder="Search order ID, customer or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        pageSize={10}
        currentPage={page}
        onPageChange={setPage}
        emptyText="No orders found"
        onRowClick={row => console.log("Clicked order:", row)}
      />

      {/* ORDER DETAIL SIDEBAR */}
      <div className="order-details-wrapper">
        <RightSidebar
          isOpen={isRightSidebarOpen}
          onClose={() => {
            setIsRightSidebarOpen(false);
            setSelectedOrder(null);
          }}
          title={selectedOrder ? selectedOrder.orderNumber : ""}
        >
          {selectedOrder && (
            <OrderDetailDrawer
              isOpen={isRightSidebarOpen}
              onClose={() => {
                setIsRightSidebarOpen(false);
                setSelectedOrder(null);
              }}
              order={selectedOrder}
            />
          )}
        </RightSidebar>
      </div>
    </div>
  );
};

export default Orders;
