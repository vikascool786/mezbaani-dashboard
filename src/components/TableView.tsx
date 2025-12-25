import React, { useEffect, useState } from "react";
import { Button, Row, Col, Badge, Form, Dropdown } from "react-bootstrap";
import CustomCard from "../UI/CustomCard";
import ModalForm from "../UI/ModalForm";
import { FormField } from "../types/FormField";
import RightSidebar from "./sidebar/RightSidebar";
import { useApi } from "../hooks/useApi";
import { Table, TableResponse } from "../types/Table";
import { groupTablesBySection } from "../utils/groupTablesBySection";
import AddItemsModal, { MenuItem } from "../UI/AddItemsModal";
import { RestaurantResponse } from "../types/Restaurant";
import DropdownSelect from "./common/DropdownSelect";
import TableOrderDrawer from "./table-order-drawer/TableOrderDrawer";

const mockOrder = {
  server: "Priya K.",
  startedAt: "1h 12m ago",
  elapsed: "1h 12m",
  runningAmount: 2100,
  status: "DINING",
  items: [],
  bill: {
    subtotal: 1660,
    gst: 83,
    serviceCharge: 166,
    total: 1909,
  },
};
export const TableView: React.FC = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { apiCall } = useApi();
  const [tables, setTables] = useState<Table[]>([]);

  const [restaurant, setRestaurant] = useState<RestaurantResponse>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  const handleReservationSubmit = (values: any) => {
    console.log("Reservation Data:", values);
    // later connect API here
  };

  //open close right sidebar
  const openRightSidebar = (table: any) => {
    setSelectedTable(table);
    setIsRightSidebarOpen(true);
    if (table.isOccupied) {
      // fetch and set order details for occupied table
    }
    if (!table.isOccupied) {
      // prepare form for new reservation
    }
  };
  const closeRightSidebar = () => setIsRightSidebarOpen(false);

  // ✅ Handle add items confirm
  const handleConfirmItems = (selected: { [key: string]: number }) => {
    console.log("Add items for table:", selectedTable?.name, selected);
    setShowAddItemsModal(false);
    // later update order state / API call
  };

  // reservation form fields
  const reservationFields: FormField[] = [
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

  //fetching RestaurantResponse list
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data: RestaurantResponse = await apiCall(baseUrl + "/restaurants");
        setRestaurant(data);
        if (data.length > 0) {
          setSelectedRestaurantId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch tables");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchDashboardTables = async () => {
      const res = await apiCall(
        `${baseUrl}/dashboard/tables/${selectedRestaurantId}`
      );
      setTables(res.tables);
    };

    fetchDashboardTables();
  }, [selectedRestaurantId]);

  const restaurantOptions = restaurant.map((r) => ({
    label: r.name,
    value: r.id,
  }));

  // Group tables by section
  const tablesBySection = groupTablesBySection(tables);

  // ✅ Handle order updated from TableOrderDrawer
  const handleOrderUpdated = async () => {
    const res = await apiCall(
      `${baseUrl}/dashboard/tables/${selectedRestaurantId}`
    );
    setTables(res.tables);
  };

  // Sort sections alphabetically or numerically
  const sortedSections = Object.keys(tablesBySection).sort((a, b) => a.localeCompare(b));

  if (loading) return <div>Loading tables...</div>;
  if (error) return <div className="text-danger">Error Loading tables...</div>;

  return (
    <div>
      {/* Page title */}
      <div className="align-items-center border-bottom d-flex justify-content-between mb-3 pb-2">
        <div className="page-title">
          <h5 className="fw-bold">Table View</h5>
          <p>Manage live tables and status</p>
        </div>
        <div className="align-items-center d-flex gap-2">
          <i className="bi bi-arrow-repeat fs-2"></i>
          <Button variant="danger" onClick={() => setShowModal(true)}>+ Table Reservation</Button>
          <Button variant="danger">Delivery</Button>
          <Button variant="danger">Take Away</Button>
          <Button variant="danger">+ Contactless</Button>
        </div>
      </div>

      <div className="d-flex gap-4 justify-content-between mb-3">
        {/* Legend row */}
        <div className="align-items-center d-flex flex-wrap gap-4">
          <div>
            <Badge bg="#D3D6D7" text="dark" className="legend-box table-blank me-2 rounded-5">
              &nbsp;
            </Badge>
            Vacant
          </div>
          <div>
            <Badge bg="#ffd6d6" className="legend-box table-running me-2 rounded-5">
              &nbsp;
            </Badge>
            Occupied
          </div>
          <div>
            <Badge bg="#cce5ff" className="legend-box table-printed me-2 rounded-5">
              &nbsp;
            </Badge>
            Bill Printed
          </div>
          <div>
            <Badge bg="#FBF7A4" className="legend-box table-paid me-2 rounded-5">
              &nbsp;
            </Badge>
            Reserved
          </div>
        </div>
        <div className="d-flex gap-4">
          {restaurantOptions.length > 0 && (
            <DropdownSelect
              label="Restaurant"
              value={selectedRestaurantId}
              options={restaurantOptions}
              placeholder="Select Restaurant"
              disabled={!restaurant.length}
              onChange={setSelectedRestaurantId}
            />
          )}
          <DropdownSelect
            label="Floor Plan"
            value={selectedFloor}
            options={[
              { label: "Default Layout", value: "default" },
              { label: "Tab Layout", value: "tab" },
            ]}
            onChange={setSelectedFloor}
          />
        </div>
      </div>


      {/* Sections */}
      {sortedSections.map((section) => (
        <div key={section}>
          <h5 className="fs-5 fw-semibold mb-3 mt-5">{section}</h5>
          <div className="d-flex gap-4 flex-wrap">
            {tablesBySection[section].map((table) => (
              <CustomCard
                key={table.id}
                status={table.status === 'OCCUPIED' ? "OCCUPIED" : table.status === 'BILLED' ? "BILLED" : table.status === 'RESERVED' ? "RESERVED" : "VACANT"}
                tableName={`${table.name}`}
                seats={`${table.seats}`}
                customerName={`${table.customerName}`}
                duration={`${table.duration}`}
                amount={table.amount}
                reservationTime={table.reservationTime}
                onClick={() => openRightSidebar(table)}

              />
            ))}
            {/* <CustomCard
              key={2}
              status={"RESERVED"}
              tableName={`T3`}
              seats={`5`}
              duration="24 min"
              customerName="John Doe"
              amount={1500}
              reservationTime="7:30 PM"
              onClick={() => openRightSidebar('2')}

            />
            <CustomCard
              key={2}
              status={"BILLED"}
              tableName={`T4`}
              seats={`5`}
              duration="24 min"
              customerName="John Doe"
              amount={1500}
              reservationTime=""
              onClick={() => openRightSidebar('2')}

            /> */}
          </div>
        </div>
      ))}

      <ModalForm
        title="Table Reservation"
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleReservationSubmit}
        fields={reservationFields}
      />

      <RightSidebar
        isOpen={isRightSidebarOpen}
        onClose={closeRightSidebar}
        title={selectedTable ? `${selectedTable.name}` : ""}
      >
        {selectedTable && (
          <TableOrderDrawer
            table={selectedTable}
            isOpen={isRightSidebarOpen}
            onClose={() => {
              setIsRightSidebarOpen(false);
              setSelectedTable(null); // ✅ memory cleared
            }}
            onOrderUpdated={handleOrderUpdated}
          />
        )}

      </RightSidebar>

      {/* ✅ Add Items Modal */}
      <AddItemsModal
        show={showAddItemsModal}
        onClose={() => setShowAddItemsModal(false)}
        onConfirm={handleConfirmItems}
      />

    </div>
  );
};
