import React from "react";
import EntityViewDrawer from "../EntityViewDrawer";
import { MenuCategory, MenuCategoryResponse } from "../../types/MenuCategory";
import "./css/MenuCategoryViewDrawer.css";

interface MenuCategoryViewDrawerProps {
  category: MenuCategory;
  onClose?: () => void;
}

const MenuCategoryViewDrawer: React.FC<MenuCategoryViewDrawerProps> = ({
  category,
  onClose,
}) => {
  return (
    <EntityViewDrawer
      title="MENU CATEGORY DETAILS"
      icon="bi-tags"
      onClose={onClose}
      fields={[
        { label: "Category Name", value: category.name },
        {
          label: "Status",
          status: category.isActive ? "ACTIVE" : "DISABLED",
        },
      ]}
    />
  );
};

export default MenuCategoryViewDrawer;
