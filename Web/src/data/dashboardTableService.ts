import { Table } from "../types/Table";
import { apiClient } from "../api/apiClient";

const isElectron = () =>
    typeof window !== "undefined" && !!window.posAPI;

export const syncDashboardTables = async (
  restaurantId: string
) => {
  if (!isElectron()) {
    console.warn("Skipping dashboard sync (not running in Electron)");
    return;
  }

  return window.posAPI.bootstrapDashboardTables(restaurantId);
};

export const getDashboardTables = async (restaurantId: string) => {
  if (!isElectron()) {
    throw new Error("Dashboard tables require Electron");
  }

  return window.posAPI.getDashboardTables(restaurantId);
};