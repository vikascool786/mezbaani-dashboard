import React from "react";
import EntityViewDrawer from "../EntityViewDrawer";
import { MenuCategory, MenuCategoryResponse } from "../../types/MenuCategory";
import "./css/MenuItemViewDrawer.css";
import { MenuItem } from "../../types/MenuItem";

interface MenuItemViewDrawerProps {
  menuItem: MenuItem;
  onClose?: () => void;
}

const MenuItemViewDrawer: React.FC<MenuItemViewDrawerProps> = ({
  menuItem,
  onClose,
}) => {
  return (
    <EntityViewDrawer
      title="MENU ITEM DETAILS"
      icon="bi-tags"
      onClose={onClose}
      fields={[
        { label: "Item Name", value: menuItem.name },
        { label: "Description", value: menuItem.description },
        { label: "Price", value: menuItem.description },
        { label: "Food Type", value: menuItem.foodType },
        { label: "Image", value: menuItem.imageUrl  },
        {
          label: "Status",
          status: menuItem.isActive ? "ACTIVE" : "DISABLED",
        },
      ]}
    />
  );
};

export default MenuItemViewDrawer;
