export interface Table {
  id: string;
  name: string;
  status: string;
  section: string;
  seats: number;
  amount: number;
  isOccupied: boolean;
  customerName: string;
  duration: string;
  reservationTime: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
}

export interface TableForm {
  id?: string;
  name: string;
  section: string;
  seats: number;
  isOccupied?: boolean;
}

export interface TableResponse {
  tables: Table[];
}