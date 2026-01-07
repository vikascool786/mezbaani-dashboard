import { MenuCategoryResponse } from "../types/MenuCategory";
import { MenuItem, MenuItemResponse } from "../types/MenuItem";
import { RestaurantResponse } from "../types/Restaurant";

const isElectron = () =>
  typeof window !== "undefined" && !!window.posAPI;

const BASE_URL = process.env.REACT_APP_BASE_URL!;

export async function getMenuItems(
  apiCall?: (url: string) => Promise<any>
): Promise<MenuItemResponse> {
  if (isElectron()) {
    return window.posAPI.getMenuItems();
  }

  if (!apiCall) {
    throw new Error("apiCall required in web mode");
  }

  return apiCall(`${BASE_URL}/menu-items`);
}

export async function syncMenuItems() {
  if (!isElectron()) return;
  return window.posAPI.syncMenuItems();
}
