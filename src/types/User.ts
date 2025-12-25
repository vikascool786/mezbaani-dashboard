export interface User {
  id: string;
  name: string;
  role: "admin" | "captain" | "waiter";
  phone: string;
  email?: string;
  restaurantId?: string;
}
