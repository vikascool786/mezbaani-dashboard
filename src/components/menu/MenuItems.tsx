// src/components/menu/MenuItems.tsx
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

const MenuItems: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Paneer Butter Masala",
      category: "Indian",
      price: 250,
      isAvailable: true,
    },
    {
      id: "2",
      name: "Veg Fried Rice",
      category: "Chinese",
      price: 180,
      isAvailable: true,
    },
  ]);

  const [search, setSearch] = useState("");

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
      )
    );
    toast.info("Item availability updated");
  };

  return (
    <>
      <h5 className="mb-3">Menu Items</h5>

      {/* Search */}
      <Form.Control
        className="mb-3"
        placeholder="Search menu item..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="card">
        <div className="card-body p-0">
          {filtered.length === 0 && (
            <p className="text-center py-3 text-muted">No items found</p>
          )}

          {filtered.map(item => (
            <div
              key={item.id}
              className="d-flex justify-content-between align-items-center border-bottom p-3"
            >
              <div>
                <strong>{item.name}</strong>
                <div className="text-muted small">
                  {item.category} • ₹{item.price}
                </div>
              </div>

              <button
                className={`btn btn-sm ${
                  item.isAvailable
                    ? "btn-outline-danger"
                    : "btn-outline-success"
                }`}
                onClick={() => toggleAvailability(item.id)}
              >
                {item.isAvailable ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MenuItems;
