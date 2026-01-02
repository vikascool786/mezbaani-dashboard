import { RestaurantResponse } from "../types/Restaurant";

const isElectron = () =>
  typeof window !== "undefined" && !!window.posAPI;

const BASE_URL = process.env.REACT_APP_BASE_URL!;

export async function getRestaurants(
  apiCall?: (url: string) => Promise<any>
): Promise<RestaurantResponse> {
  if (isElectron()) {
    return window.posAPI.getRestaurants();
  }

  if (!apiCall) {
    throw new Error("apiCall required in web mode");
  }

  return apiCall(`${BASE_URL}/restaurants`);
}

export async function syncRestaurants() {
  if (!isElectron()) return;
  return window.posAPI.syncRestaurants();
}
