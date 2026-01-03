import React, { useEffect, useMemo, useState, useCallback } from "react";
import DataTable from "../components/common/DataTable/DataTable";
import { Column } from "../components/common/DataTable/types";
import { Button } from "react-bootstrap";
import { useApi } from "../hooks/useApi";
import { Table, TableForm } from "../types/Table";
import RightSidebar from "../components/sidebar/RightSidebar";
import TableEditDrawer from "../components/table-list-drawer/TableEditDrawer";
import TableViewDrawer from "../components/table-list-drawer/TableViewDrawer";
import { toast } from "react-toastify";
import OrderActions from "../components/table-order-drawer/OrderActions";
import { useSelectedRestaurant } from "../context/SelectedRestaurantContext";


const EMPTY_TABLE: any = {
  id: "",
  name: "",
  section: "",
  seats: 1,
  isOccupied: false,
};

const Tables: React.FC = () => {
  //get global restaurant ID from hook + context
  const { globalRestaurantId } = useSelectedRestaurant();

  const [search, setSearch] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [page, setPage] = useState(1);

  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add" | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const { apiCall } = useApi();
  const baseUrl = process.env.REACT_APP_BASE_URL;

  /* ---------------- Fetch Tables ---------------- */
  const fetchTables = async (id: string) => {
    try {
      const res = await apiCall(
        `${baseUrl}/tables/${id}`
      );
      setTables(res.tables);
    } catch {
      toast.error("Failed to load tables");
    }
  };

  useEffect(() => {
    if(globalRestaurantId){
      fetchTables(globalRestaurantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalRestaurantId]);



  /* ---------------- Search ---------------- */
  const filteredTables = useMemo(() => {
    if (!search.trim()) return tables;

    const term = search.toLowerCase();
    return tables.filter(
      t =>
        t.id.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term)
    );
  }, [tables, search]);

  /* ---------------- Handlers ---------------- */
  const openDrawer = (table: Table, mode: "view" | "edit" | "add") => {
    setSelectedTable(table);
    setDrawerMode(mode);
    setIsRightSidebarOpen(true);
  };

  const handleAddTable = () => {
    openDrawer(EMPTY_TABLE, "add");
  };


  const handleViewTable = useCallback((id: string) => {
    const table = tables.find(t => t.id === id);
    if (table) openDrawer(table, "view");
  }, [tables]);

  const handleEditTable = useCallback((id: string) => {
    const table = tables.find(t => t.id === id);
    if (table) openDrawer(table, "edit");
  }, [tables]);

  const handleDeleteTable = async (id: string) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;
    const confirm = window.confirm(
      `Are you sure you want to delete table "${table.name}"?`
    );

    if (!confirm) return;
    try {
      await apiCall(
        `${baseUrl}/tables/${table?.restaurantId}/${id}`,
        {
          method: "DELETE"
        }
      );

      setTables(prev => prev.filter(t => t.id !== table.id));
      toast.success("Table deleted successfully");
    } catch (error) {
      toast.error("Failed to delete table");
    }
  };

  const handleUpdateTable = async (updated: Table) => {
    try {
      await apiCall(
        `${baseUrl}/tables/${selectedTable?.restaurantId}/${updated.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: updated.name,
            section: updated.section,
            seats: updated.seats
          }),
        }
      );

      setTables(prev =>
        prev.map(t => (t.id === updated.id ? updated : t))
      );
      toast.success("Table updated successfully");
    } catch (error) {
      toast.error("Failed to update table");
    }
  };
  const handleAddTableFinal = async (table: Table) => {
    try {
      await apiCall(
        `${baseUrl}/tables/92562176-5ab3-427e-90c4-3b956a28df0f`,
        {
          method: "POST",
          body: JSON.stringify({
            name: table.name,
            section: table.section,
            seats: table.seats
          }),
        }
      );
      toast.success("Table Add successfully");
      closeDrawer();
      if(globalRestaurantId){
        fetchTables(globalRestaurantId); // ✅ SAFE
      }
    } catch (error) {
      toast.error("Failed to add table");
    }
  };

  const closeDrawer = () => {
    setIsRightSidebarOpen(false);
    setSelectedTable(null);
    setDrawerMode(null);
  };

  // reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredTables.length / 10);

    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredTables.length, page]);

  /* ---------------- Columns ---------------- */
  const columns: Column<Table>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "section", header: "Section", sortable: true },
    { key: "seats", header: "Seats", sortable: true },
    {
      key: "actions",
      header: "",
      render: row => (
        <OrderActions
          order={row}
          actions={[
            { type: "view", label: "View", onClick: handleViewTable },
            { type: "edit", label: "Edit", onClick: handleEditTable },
            { type: "delete", label: "Delete", onClick: handleDeleteTable },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
        <h5 className="fw-bold mb-0">Tables</h5>
        <Button variant="danger" size="sm" onClick={handleAddTable}>Add Table</Button>
      </div>

      {/* SEARCH */}
      <div className="mb-3 w-25">
        <input
          className="form-control"
          placeholder="Search tables..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredTables}
        emptyText="No tables found"
        pageSize={10}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* RIGHT SIDEBAR */}
      <div className="table-details-wrapper">
        <RightSidebar
          isOpen={isRightSidebarOpen}
          onClose={closeDrawer}
          title={
            drawerMode === "add"
              ? "Add Table"
              : drawerMode === "edit"
                ? "Edit Table"
                : "Table Details"
          }
        >
          {drawerMode === "view" && selectedTable && (
            <TableViewDrawer onClose={closeDrawer} table={selectedTable} />
          )}

          {drawerMode === "edit" && selectedTable && (
            <TableEditDrawer
              table={selectedTable}
              onClose={closeDrawer}
              onUpdate={handleUpdateTable}
            />
          )}
          {drawerMode === "add" && (
            <TableEditDrawer
              table={EMPTY_TABLE}
              onClose={closeDrawer}
              onUpdate={handleAddTableFinal}
            />
          )}
        </RightSidebar>
      </div>
    </div>
  );
};

export default Tables;
