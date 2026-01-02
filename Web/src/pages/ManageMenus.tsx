// src/pages/ManageMenus.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import MenuCategories from "../components/menu/MenuCategories";
import MenuItems from "../components/menu/MenuItems";

interface ManageMenusProps {
  type: "categories" | "items";
}

const ManageMenus: React.FC<ManageMenusProps> = ({ type }) => {
  return (
    <>
      {type === "categories" && <MenuCategories />}
      {type === "items" && <MenuItems />}
    </>
  );
};

export default ManageMenus;
