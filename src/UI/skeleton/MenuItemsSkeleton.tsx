import React from "react";
import "./css/menuItemsSkeleton.css";

interface Props {
  rows?: number;
}

const MenuItemsSkeleton: React.FC<Props> = ({ rows = 6 }) => {
  return (
    <div className="menu-skel__wrapper">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="menu-skel__card">
          {/* LEFT */}
          <div className="menu-skel__left">
            <div className="menu-skel__food-dot shimmer" />

            <div className="menu-skel__text">
              <div className="menu-skel__title shimmer" />
              <div className="menu-skel__desc shimmer" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="menu-skel__right">
            <div className="menu-skel__price shimmer" />
            <div className="menu-skel__btn shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuItemsSkeleton;
