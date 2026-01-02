import { Table } from "./Table";
import { User } from "./User";

export interface OrderItem {
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  quantityPrinted?: number;
  quantityServed: number;
  quantityCancelled: number;
}

export interface Order {
  id: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  orderNumber: string;
  subtotal: string;
  taxAmount: string;
  gstPercent: number;
  serviceCharge: string;
  total: string;
  tableId: string;
  openedAt: string;
  createdAt: string;
  closedAt: string | null;
  userId: string;
  items: OrderItem[];
  Table: Table | null;
  user: User | null;
}