import { MenuCategoryResponse } from "../types/MenuCategory";
import { MenuItem } from "../types/MenuItem";
import { Order } from "../types/Order";
import { RestaurantResponse } from "../types/Restaurant";

const isElectron = () =>
  typeof window !== "undefined" && !!window.posAPI;

const BASE_URL = process.env.REACT_APP_BASE_URL!;

export async function getOrders(
  apiCall?: (url: string) => Promise<any>
): Promise<Order[]> {
  if (isElectron()) {
    return window.posAPI.getOrders();
  }

  if (!apiCall) {
    throw new Error("apiCall required in web mode");
  }

  return apiCall(`${BASE_URL}/orders`);
}

export async function syncOrders() {
  if (!isElectron()) return;
  return window.posAPI.syncOrders();
}
