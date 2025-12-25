// src/components/menu/MenuCategories.tsx
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface MenuCategory {
  id: string;
  name: string;
  isActive: boolean;
}

const MenuCategories: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: "1", name: "Indian", isActive: true },
    { id: "2", name: "Chinese", isActive: true },
  ]);

  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const addCategory = () => {
    if (!newCategory.trim()) return;

    setCategories(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newCategory,
        isActive: true,
      },
    ]);

    setNewCategory("");
    toast.success("Category added");
  };

  const toggleStatus = (id: string) => {
    setCategories(prev =>
      prev.map(c =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
    toast.info("Category status updated");
  };

  return (
    <>
      <h5 className="mb-3">Menu Categories</h5>

      {/* Search + Add */}
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          placeholder="Search category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <Form.Control
          placeholder="New category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />

        <button className="btn btn-primary" onClick={addCategory}>
          Add
        </button>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-body p-0">
          {filtered.length === 0 && (
            <p className="text-center py-3 text-muted">No categories found</p>
          )}

          {filtered.map(cat => (
            <div
              key={cat.id}
              className="d-flex justify-content-between align-items-center border-bottom p-3"
            >
              <div>
                <strong>{cat.name}</strong>
                <div className="text-muted small">
                  {cat.isActive ? "Active" : "Disabled"}
                </div>
              </div>

              <button
                className={`btn btn-sm ${
                  cat.isActive ? "btn-outline-danger" : "btn-outline-success"
                }`}
                onClick={() => toggleStatus(cat.id)}
              >
                {cat.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuCategories;
