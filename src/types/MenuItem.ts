export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  foodType: "veg" | "non-veg";
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  categoryId: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
}