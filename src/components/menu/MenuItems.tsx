import React, { useEffect, useMemo, useState, useCallback } from "react";
import DataTable from "../../components/common/DataTable/DataTable";
import { Column } from "../../components/common/DataTable/types";
import { Button } from "react-bootstrap";
import { useApi } from "../../hooks/useApi";
import RightSidebar from "../../components/sidebar/RightSidebar";
import { toast } from "react-toastify";
import DrawerActions from "../DrawerActions";
import { MenuItem, MenuItemCategory } from "../../types/MenuItem";
import MenuItemEditDrawer from "../menu-Item-list-drawer/MenuItemEditDrawer";
import MenuItemViewDrawer from "../menu-Item-list-drawer/MenuItemViewDrawer";

const EMPTY_ITEM: MenuItem = {
  id: "",
  name: "",
  description: "",
  price: 0,
  foodType: "veg",
  imageUrl: "",
  isAvailable: true,
  sortOrder: 0,
  isActive: true,
  categoryId: ""
};

const MenuItems: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<MenuItemCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);

  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add" | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<MenuItemCategory | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const { apiCall } = useApi();
  const baseUrl = process.env.REACT_APP_BASE_URL;

  /* ---------------- Fetch Tables ---------------- */
  const fetchMenuCategories = async () => {
    try {
      const res = await apiCall(
        `${baseUrl}/menu-categories`
      );
      setCategories(res.categories);
    } catch {
      toast.error("Failed to load menu categories");
    }
  };
  const fetchMenuItems = async () => {
    try {
      const res = await apiCall(
        `${baseUrl}/menu-items`
      );
      setMenuItems(res.items);
    } catch {
      toast.error("Failed to load menu Items");
    }
  };

  useEffect(() => {
    fetchMenuCategories();
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [categories]);

  /* ---------------- Search ---------------- */
  const filteredMenuItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = term
      ? menuItems.filter(
        t =>
          t.id.toLowerCase().includes(term) ||
          t.name.toLowerCase().includes(term)
      )
      : [...menuItems]; // 👈 copy to avoid mutation

    return filtered.sort((a, b) => {
      const catA = categoryMap.get(a.categoryId ?? "") ?? "";
      const catB = categoryMap.get(b.categoryId ?? "") ?? "";

      return catA.localeCompare(catB);
    });
  }, [menuItems, search, categoryMap]);

  /* ---------------- Handlers ---------------- */
  const openDrawer = (menuItem: MenuItem, mode: "view" | "edit" | "add") => {
    setSelectedMenuItem(menuItem);
    setDrawerMode(mode);
    setIsRightSidebarOpen(true);
  };


  const handleAddMenuItem = () => {
    console.log("tess")
    openDrawer(EMPTY_ITEM, "add");
  };


  const handleViewMenuItem = useCallback((id: string) => {
    const item = menuItems.find(c => c.id === id);
    if (item) openDrawer(item, "view");
  }, [menuItems]);


  const handleEditMenuItem = useCallback((id: string) => {
    const item = menuItems.find(t => t.id === id);
    if (item) openDrawer(item, "edit");
  }, [menuItems]);

  const handleDeleteMenuItem = async (id: string) => {
    const item = menuItems.find(t => t.id === id);
    if (!item) return;
    const confirm = window.confirm(
      `Are you sure you want to delete menu item "${item.name}"?`
    );

    if (!confirm) return;
    try {
      await apiCall(`${baseUrl}/menu-items/${id}`, {
        method: "DELETE",
      });


      setMenuItems(prev => prev.filter(t => t.id !== item.id));
      toast.success("Menu items deleted successfully");
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const handleUpdateMenuItem = async (updated: MenuItem) => {
    try {
      await apiCall(`${baseUrl}/menu-items/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: updated.name,
          description: updated.description,
          foodType: updated.foodType,
          price: updated.price,
          imageUrl: updated.imageUrl,
          categoryId: updated.categoryId,
        }),
      });

      setMenuItems(prev =>
        prev.map(c => (c.id === updated.id ? updated : c))
      );

      toast.success("Menu item updated successfully");
      closeDrawer();
    } catch {
      toast.error("Failed to update menu item");
    }
  };

  const handleAddMenuItemFinal = async (item: MenuItem) => {
    try {
      await apiCall(`${baseUrl}/menu-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          foodType: item.foodType,
          price: item.price,
          imageUrl: item.imageUrl,
          isActive: item.isActive,
          categoryId: item.categoryId
        }),
      });

      toast.success("Menu item added successfully");
      closeDrawer();
      fetchMenuItems();
    } catch {
      toast.error("Failed to add menu item");
    }
  };


  const closeDrawer = () => {
    setIsRightSidebarOpen(false);
    setSelectedMenuItem(null);
    setDrawerMode(null);
  };

  // reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredMenuItems.length / 10);

    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredMenuItems.length, page]);

  /* ---------------- Columns ---------------- */
  const columns: Column<MenuItem>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: row => {
        const category = categories.find(c => c.id === row.categoryId);
        if (!category) return "—";

        return (
          <span className={!category.isActive ? "text-muted fst-italic" : ""}>
            {category.name}
          </span>
        );
      }
    },

    { key: "description", header: "description", sortable: true },
    { key: "price", header: "price", sortable: true },
    { key: "foodType", header: "foodType", sortable: true },
    {
      key: "imageUrl",
      header: "Image",
      render: row => (
        <img
          src={row.imageUrl}
          alt={row.name}
          style={{
            width: 30,
            height: 30,
            objectFit: "cover",
            borderRadius: 6,
          }}
        // onError={e => {
        //   (e.target as HTMLImageElement).src = "/placeholder.png";
        // }}
        />
      ),
    },
    { key: "isActive", header: "Status", sortable: true, render: row => (row.isActive ? "Active" : "Disabled"), },
    {
      key: "actions",
      header: "",
      render: row => (
        <>
          <DrawerActions
            entity={{ id: row.id }}
            actions={[
              { type: "view", label: "View", onClick: handleViewMenuItem },
              { type: "edit", label: "Edit Menu Item", onClick: handleEditMenuItem },
              {
                type: "disable",
                label: "Disable Menu Item",
                onClick: handleDeleteMenuItem,
              },
            ]}
          />

        </>
      ),
    },
  ];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
        <h5 className="fw-bold mb-0">Menu Item</h5>
        <Button variant="danger" size="sm" onClick={handleAddMenuItem}>Add Menu Item</Button>
      </div>

      {/* SEARCH */}
      <div className="mb-3 w-25">
        <input
          className="form-control"
          placeholder="Search menu items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredMenuItems}
        emptyText="No tables found"
        pageSize={10}
        currentPage={page}
        onPageChange={setPage}
      />

      {/* RIGHT SIDEBAR */}
      <div className="table-details-wrapper">
        <RightSidebar
          isOpen={isRightSidebarOpen}
          onClose={closeDrawer}
          title={
            drawerMode === "add"
              ? "Add Menu Item"
              : drawerMode === "edit"
                ? "Edit Menu Item"
                : "Menu Item Details"
          }
        >
          {drawerMode === "view" && selectedMenuItem && (
            <MenuItemViewDrawer
              menuItem={selectedMenuItem}
              onClose={closeDrawer}
            />
          )}

          {drawerMode === "edit" && selectedMenuItem && (
            <MenuItemEditDrawer
              menuItem={selectedMenuItem}
              categories={categories}
              onClose={closeDrawer}
              onSubmit={handleUpdateMenuItem}
            />
          )}

          {drawerMode === "add" && (
            <MenuItemEditDrawer
              menuItem={EMPTY_ITEM}
              categories={categories}
              onClose={closeDrawer}
              onSubmit={handleAddMenuItemFinal}
            />
          )}

        </RightSidebar>
      </div>
    </div>
  );
};

export default MenuItems;
