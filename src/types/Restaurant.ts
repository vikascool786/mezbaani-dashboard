export interface RestaurantOwner {
  id: string;
  name: string;
  email: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  phone: string;
  address: string;
  logo: string;
  user_id: string;

  gstPercent: string;
  serviceChargePercent: string;
  defaultDiscountPercent: string;

  isGstEnabled: boolean;
  isServiceChargeEnabled: boolean;

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  owner: RestaurantOwner;
}

export type RestaurantResponse = Restaurant[];
