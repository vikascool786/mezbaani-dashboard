import { Table } from "../types/Table";
import { apiClient } from "../api/apiClient";

const isElectron = () =>
  typeof window !== "undefined" && !!window.posAPI;

/* -----------------------------
   READ TABLES
------------------------------ */
export async function getDashboardTables(
  restaurantId: string
): Promise<Table[]> {
  if (isElectron()) {
    return window.posAPI.getDashboardTables(restaurantId);
  }

  // Web → API
  const baseUrl = process.env.REACT_APP_BASE_URL!;
  const res = await apiClient.apiCall(
    `${baseUrl}/dashboard/tables/${restaurantId}`
  );

  return res.tables;
}

// SYNC TABLES (Electron only)
export async function syncTables() {
  if (!isElectron()) return;
  return window.posAPI.syncTables();
}
