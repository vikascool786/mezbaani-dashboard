import React, { useEffect, useMemo, useState, useCallback } from "react";
import DataTable from "../../components/common/DataTable/DataTable";
import { Column } from "../../components/common/DataTable/types";
import { Button } from "react-bootstrap";
import { useApi } from "../../hooks/useApi";
import RightSidebar from "../../components/sidebar/RightSidebar";
import MenuCategoryEditDrawer from "../../components/menu-category-list-drawer/MenuCategoryEditDrawer";
import MenuCategoryViewDrawer from "../../components/menu-category-list-drawer/MenuCategoryViewDrawer";
import { toast } from "react-toastify";
import DrawerActions from "../DrawerActions";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { getMenuCategories, syncMenuCategories } from "../../data/menuCategoryService";

interface MenuCategory {
  id: string;
  name: string;
  isActive: boolean;
}

const EMPTY_CATEGORY: MenuCategory = {
  id: "",
  name: "",
  isActive: true
};

const MenuCategories: React.FC = () => {
  const { apiCall, token } = useApi();
  const isOnline = useNetworkStatus();

  /**
   * UI State
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [page, setPage] = useState(1);

  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add" | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<MenuCategory | null>(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;

  /* ---------------- Fetch Tables ---------------- */
  const fetchMenuCategories = async (online?: boolean) => {
    setLoading(true);
    try {
      // Electron flow
      if (online == true && window.posAPI) {
        console.log("test")
        if (!token) {
          throw new Error("Auth token missing");
        }
        if (isOnline) {
          // when ONLINE
          await syncMenuCategories();
        }
        const data = await getMenuCategories(apiCall);
        const categoriesArray = Array.isArray(data)
          ? data
          : data?.categories ?? [];

        setCategories(categoriesArray);
        return;
      }

      // WEB Flow 
      const data = await getMenuCategories(apiCall);
      const categoriesArray = Array.isArray(data)
        ? data
        : data?.categories ?? [];

      setCategories(categoriesArray);

    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!token) return;
    fetchMenuCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => {
    if (!token) return;
    fetchMenuCategories(isOnline as boolean);
  }, [isOnline]);



  /* ---------------- Search ---------------- */
  const filteredMenuCategories = useMemo(() => {
    console.log(categories)
    if (!Array.isArray(categories)) return [];
    if (!search.trim()) return categories;

    const term = search.toLowerCase();
    return categories.filter(
      t =>
        t.id.toLowerCase().includes(term) ||
        t.name.toLowerCase().includes(term)
    );
  }, [categories, search]);

  console.log("filteredMenuCategories", filteredMenuCategories)
  /* ---------------- Handlers ---------------- */
  const openDrawer = (category: MenuCategory, mode: "view" | "edit" | "add") => {
    setSelectedMenuCategory(category);
    setDrawerMode(mode);
    setIsRightSidebarOpen(true);
  };


  const handleAddMenuCategory = () => {
    openDrawer(EMPTY_CATEGORY, "add");
  };


  const handleViewCategory = useCallback((id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) openDrawer(category, "view");
  }, [categories]);


  const handleEditCategoriey = useCallback((id: string) => {
    const category = categories.find(t => t.id === id);
    if (category) openDrawer(category, "edit");
  }, [categories]);

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(t => t.id === id);
    if (!category) return;
    const confirm = window.confirm(
      `Are you sure you want to delete categories "${category.name}"?`
    );

    if (!confirm) return;
    try {
      await apiCall(`${baseUrl}/menu-categories/${id}`, {
        method: "DELETE",
      });


      setCategories(prev => prev.filter(t => t.id !== category.id));
      toast.success("Table deleted successfully");
    } catch (error) {
      toast.error("Failed to delete table");
    }
  };

  const handleUpdateMenuCategories = async (updated: MenuCategory) => {
    try {
      await apiCall(`${baseUrl}/menu-categories/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: updated.name,
          isActive: updated.isActive,
        }),
      });

      setCategories(prev =>
        prev.map(c => (c.id === updated.id ? updated : c))
      );

      toast.success("Category updated successfully");
      closeDrawer();
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleAddMenuCategoryFinal = async (category: MenuCategory) => {
    try {
      await apiCall(`${baseUrl}/menu-categories`, {
        method: "POST",
        body: JSON.stringify({
          name: category.name,
          isActive: category.isActive,
        }),
      });

      toast.success("Menu category added successfully");
      closeDrawer();
      fetchMenuCategories();
    } catch {
      toast.error("Failed to add category");
    }
  };


  const closeDrawer = () => {
    setIsRightSidebarOpen(false);
    setSelectedMenuCategory(null);
    setDrawerMode(null);
  };

  // reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!filteredMenuCategories?.length) return;
    const totalPages = Math.ceil(filteredMenuCategories.length / 10);

    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredMenuCategories, page]);

  /* ---------------- Columns ---------------- */
  const columns: Column<MenuCategory>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "isActive", header: "Status", sortable: true, render: row => (row.isActive ? "Active" : "Disabled"), },
    {
      key: "actions",
      header: "",
      render: row => (
        <>
          <DrawerActions
            entity={{ id: row.id }}
            actions={[
              { type: "view", label: "View", onClick: handleViewCategory },
              { type: "edit", label: "Edit Category", onClick: handleEditCategoriey },
              {
                type: "disable",
                label: "Disable Category",
                onClick: handleDeleteCategory,
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
        <h5 className="fw-bold mb-0">Menu Categories</h5>
        <Button variant="danger" size="sm" onClick={handleAddMenuCategory}>Add Table</Button>
      </div>

      {/* SEARCH */}
      <div className="mb-3 w-25">
        <input
          className="form-control"
          placeholder="Search tables..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredMenuCategories}
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
              ? "Add Table"
              : drawerMode === "edit"
                ? "Edit Table"
                : "Table Details"
          }
        >
          {drawerMode === "view" && selectedMenuCategory && (
            <MenuCategoryViewDrawer
              category={selectedMenuCategory}
              onClose={closeDrawer}
            />
          )}

          {drawerMode === "edit" && selectedMenuCategory && (
            <MenuCategoryEditDrawer
              category={selectedMenuCategory}
              onClose={closeDrawer}
              onSubmit={handleUpdateMenuCategories}
            />
          )}

          {drawerMode === "add" && (
            <MenuCategoryEditDrawer
              category={EMPTY_CATEGORY}
              onClose={closeDrawer}
              onSubmit={handleAddMenuCategoryFinal}
            />
          )}

        </RightSidebar>
      </div>
    </div>
  );
};

export default MenuCategories;
