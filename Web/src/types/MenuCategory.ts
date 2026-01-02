export interface MenuCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface MenuCategoryResponse {
  categories: MenuCategory[];
}