/**
 * TableView.tsx
 *
 * This screen shows live table status for a selected restaurant.
 * It works in BOTH:
 *  - Web (API → UI)
 *  - Electron (API → SQLite → UI)
 *
 * Key Responsibilities:
 * 1. Bootstrap restaurants after login
 * 2. Sync data (Electron only)
 * 3. Load dashboard tables for selected restaurant
 * 4. Render table grid & handle interactions
 */
import React, { useEffect, useState } from "react";
import { Button, Badge } from "react-bootstrap";
import CustomCard from "../UI/CustomCard";
import ModalForm from "../UI/ModalForm";
import { FormField } from "../types/FormField";
import RightSidebar from "./sidebar/RightSidebar";
import { useApi } from "../hooks/useApi";
import { Table } from "../types/Table";
import { groupTablesBySection } from "../utils/groupTablesBySection";
import AddItemsModal from "../UI/AddItemsModal";
import { RestaurantResponse } from "../types/Restaurant";
import DropdownSelect from "./common/DropdownSelect";
import TableOrderDrawer from "./table-order-drawer/TableOrderDrawer";
import { getRestaurants, syncRestaurants } from "../data/restaurantService";
import { getDashboardTables, syncTables } from "../data/tableService";
import { syncRoles } from "../data/roleService";
import { syncDashboardTables } from "../data/dashboardTableService";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useSelectedRestaurant } from "../context/SelectedRestaurantContext";


export const TableView: React.FC = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;

  // checking online or not
  const isOnline = useNetworkStatus();

  // restaurant hook 
  const { setGlobalRestaurantId } = useSelectedRestaurant();

  /**
   * Auth
   * token comes from:
   * - Web → normal auth flow
   * - Electron → SQLite session
   */
  const { apiCall, token } = useApi();

  /**
   * UI State
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Restaurant State
   */
  const [restaurant, setRestaurant] = useState<RestaurantResponse>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  /**
   * Table State
   */
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  /**
   * UI Modals & Drawers
   */
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // BOOTSTRAP RESTAURANTS (AFTER LOGIN)
  useEffect(() => {
    if (!token) return;
    const fetchRestaurants = async () => {
      try {
        setLoading(true);

        // Electron flow
        if (window.posAPI) {
          if (isOnline) {
            // when ONLINE
            await syncRoles(token);
            await syncRestaurants();
            await syncTables();
          }
          const data = await getRestaurants(apiCall);
          setRestaurant(data);
          if (data.length > 0) {
            setSelectedRestaurantId(data[0].id);
          }
          return;
        }

        // WEB Flow 
        const data = await getRestaurants(apiCall);
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
  }, [token, isOnline]);

  // LOAD DASHBOARD TABLES (WHEN RESTAURANT CHANGES)
  useEffect(() => {
    if (!selectedRestaurantId) return;
    setGlobalRestaurantId(selectedRestaurantId);

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const isElectronOnline = isOnline && window.posAPI;

        // Electron + Online Sync
        if (isElectronOnline) {
          if (!token) {
            throw new Error("Auth token missing");
          }

          if (isOnline) {
            await syncDashboardTables(selectedRestaurantId);
          }
        }
        const data = await getDashboardTables(selectedRestaurantId);
        setTables(data);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedRestaurantId, isOnline]);

  // UI HELPERS
  const restaurantOptions = restaurant.map((r) => ({
    label: r.name,
    value: r.id,
  }));
  const tablesBySection = groupTablesBySection(tables); // Group tables by section
  const sortedSections = Object.keys(tablesBySection).sort((a, b) => a.localeCompare(b));

  // HANDLERS
  const openRightSidebar = (table: Table) => {
    setSelectedTable(table);
    setIsRightSidebarOpen(true);
  };

  const closeRightSidebar = () => {
    setSelectedTable(null);
    setIsRightSidebarOpen(false);
  };

  const handleOrderUpdated = async () => { //Handle order updated from TableOrderDrawer
    if (!selectedRestaurantId) return;

    const res = await apiCall(
      `${baseUrl}/dashboard/tables/${selectedRestaurantId}`
    );
    setTables(res.tables);
  };

  const handleReservationSubmit = (values: any) => {
    console.log("Reservation Data:", values);

    // later connect API here
  };

  // Handle add items confirm
  const handleConfirmItems = (selected: { [key: string]: number }) => {
    setShowAddItemsModal(false);
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

  // RENDER
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
          <i
            className="bi bi-arrow-repeat fs-2"
            onClick={async () => {
              if (!selectedRestaurantId || !token) return;
              if (isOnline) {
                await syncDashboardTables(selectedRestaurantId);
              }
              const data = await getDashboardTables(selectedRestaurantId);
              setTables(data);
            }}
          />

          <Button variant="danger" onClick={() => setShowReservationModal(true)}>+ Table Reservation</Button>
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
          </div>
        </div>
      ))}

      <ModalForm
        title="Table Reservation"
        show={showReservationModal}
        onClose={() => setShowReservationModal(false)}
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
