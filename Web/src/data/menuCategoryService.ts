import { MenuCategoryResponse } from "../types/MenuCategory";
import { RestaurantResponse } from "../types/Restaurant";

const isElectron = () =>
  typeof window !== "undefined" && !!window.posAPI;

const BASE_URL = process.env.REACT_APP_BASE_URL!;

export async function getMenuCategories(
  apiCall?: (url: string) => Promise<any>
): Promise<MenuCategoryResponse> {
  if (isElectron()) {
    return window.posAPI.getMenuCategories();
  }

  if (!apiCall) {
    throw new Error("apiCall required in web mode");
  }

  return apiCall(`${BASE_URL}/menu-categories`);
}

export async function syncMenuCategories() {
  if (!isElectron()) return;
  return window.posAPI.syncMenuCategories();
}
