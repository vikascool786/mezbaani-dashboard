export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  foodType: FoodType;
  imageUrl: string;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date; // ISO date string
  updatedAt?: Date; // ISO date string
  restaurantId?: string;
  categoryId?: string;
  MenuCategory?: MenuCategory;
}

export type FoodType = "veg" | "non-veg";

export interface MenuCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  restaurantId?: string;
}
export interface MenuItemCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  restaurantId?: string;
}