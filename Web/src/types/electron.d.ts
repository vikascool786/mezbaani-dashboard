import { MenuCategoryResponse } from "./MenuCategory";
import { MenuItem, MenuItemResponse } from "./MenuItem";
import { Order } from "./Order";

export { };

declare global {
  interface Window {
    posAPI: {
      /* ---------- READ ---------- */
      login: (data: { phone: string; password: string }) => Promise<any>;
      logout: () => Promise<void>;
      getAuthSession: () => Promise<{
        token: string;
        userId: string;
        phone: string;
        email?: string;
        roleName: "admin" | "captain" | "waiter";
        restaurantId?: string;
      } | null>;
      getUsers: () => Promise<any[]>;
      getRoles: () => Promise<any[]>;
      getRestaurants: () => Promise<any[]>;
      getDashboardTables: (restaurantId: string) => Promise<any[]>;
      getTables: (restaurantId: string) => Promise<any[]>;
      getOrders: () => Promise<Order[]>;
      getMenuCategories: () => Promise<MenuCategoryResponse>;
      getMenuItems: () => Promise<MenuItemResponse>;

      /* ---------- SYNC ---------- */
      syncDashboardTables: (restaurantId: string) => Promise<{ success: boolean; synced: number }>;
      syncRestaurants: () => Promise<{ success: boolean; synced: number }>;
      syncTables: () => Promise<{ success: boolean; synced: number }>;
      syncRoles: (token: string) => Promise<any>;
      syncUsers: (token: string) => Promise<any>;
      syncMenuCategories: () => Promise<any>;
      syncMenuItems: () => Promise<any>;
      syncOrders: () => Promise<any>;

       /* ---------- SYSTEM ---------- */
      isOnline: () => Promise<boolean>;
    };
  }
}
