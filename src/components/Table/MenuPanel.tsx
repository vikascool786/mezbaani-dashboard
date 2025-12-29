import React, { useEffect, useMemo, useState } from "react";
import { MenuItem } from "../../types/MenuItem";
import MenuItemsSkeleton from "../../UI/skeleton/MenuItemsSkeleton";

interface Props {
    isOpen: boolean;
    menuItems: MenuItem[];
    allMenuItems: MenuItem[];
    categories: any[];
    activeCategoryId: string | null;
    setActiveCategoryId: (id: string) => void;
    loading: boolean;
    getDraftQty: (menuItemId: string) => number;
    onAddItem: (item: MenuItem) => void;
    onRemoveItem: (menuItemId: string) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const MenuPanel: React.FC<Props> = ({
    isOpen,
    menuItems,
    allMenuItems,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    loading,
    getDraftQty,
    onAddItem,
    onRemoveItem,
    searchTerm,
    setSearchTerm
}) => {
    if (!isOpen) return null;

    return (
        <aside className="drawer-root left-menuitem">
            {/* HEADER */}
            <div className="menu-header">
                <h6>MENU ITEMS</h6>
                <span className="text-muted small">Tap to add</span>
            </div>

            {/* SEARCH */}
            <div className="menu-search">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search menu items"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="menu-wrapper-section">
                {/* CATEGORIES */}
                <div className="menu-categories">
                    {categories.map(cat => {
                        const count = allMenuItems.filter(
                            item =>
                                item.categoryId === cat.id &&
                                item.isActive &&
                                item.isAvailable
                        ).length;

                        return (
                            <div
                                key={cat.id}
                                className={`category ${activeCategoryId === cat.id ? "active" : ""
                                    }`}
                                onClick={() => setActiveCategoryId(cat.id)}
                            >
                                {cat.name}
                                <span>{count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* MENU ITEMS */}
                <div className="menu-items">
                    {loading && <MenuItemsSkeleton rows={6} />}

                    {menuItems.map(item => {
                        const qty = getDraftQty(item.id);

                        return (
                            <div key={item.id} className="menu-item-card compact">
                                <div className="menu-item-wrapper">
                                    <span
                                        className={`food-type ${item.foodType === "veg" ? "veg" : "non-veg"
                                            }`}
                                    >
                                        <span className="dot" />
                                    </span>

                                    <div>
                                        <div className="menu-item-title">{item.name}</div>
                                        <div className="menu-item-meta">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>

                                <div className="atc__menu-item-action">
                                    <div className="atc__price">₹{item.price}</div>

                                    {qty === 0 ? (
                                        <button
                                            className="atc__add-btn"
                                            onClick={() => onAddItem(item)}
                                        >
                                            ADD
                                        </button>
                                    ) : (
                                        <div className="atc__qty-stepper">
                                            <button
                                                className="atc__step-btn"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                −
                                            </button>   

                                            <span className="atc__qty">{qty}</span>

                                            <button
                                                className="atc__step-btn"
                                                onClick={() => onAddItem(item)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};

export default MenuPanel;
