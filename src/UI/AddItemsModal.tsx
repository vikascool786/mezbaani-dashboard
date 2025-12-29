// src/components/UI/AddItemsModal.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useApi } from "../hooks/useApi";
import { MenuItem } from "../types/MenuItem";

// export interface MenuItem {
//   id: string;
//   name: string;
//   price: number;
//   imageUrl?: string;
//   isAvailable?: boolean;
//   MenuCategory?: { name: string };
// }

interface AddItemsModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: { [key: string]: number }) => void;
}

const AddItemsModal: React.FC<AddItemsModalProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { apiCall } = useApi();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Fetch menu items when modal opens
  useEffect(() => {
    if (!show) return;
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data: MenuItem[] = await apiCall(baseUrl + "/menu-items");
        setItems(data.filter((item) => item.isAvailable)); // only available items
      } catch (err: any) {
        console.error("Failed to fetch menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [show]);

  // Filter items by search
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const newQty = (prev[id] || 0) + delta;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const subtotal = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      scrollable
      backdrop="static"
      keyboard
      top
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Items 2</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <Form.Control
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between py-2 border-bottom"
                >
                  <div>
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted">₹{item.price.toFixed(2)}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      -
                    </Button>
                    <span>{quantities[item.id] || 0}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center text-muted py-3">No items found</div>
              )}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="fw-bold">Subtotal: ₹{subtotal.toFixed(2)}</div>
        <div>
          <Button variant="secondary" onClick={onClose} className="me-2">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(quantities)}
            disabled={Object.keys(quantities).length === 0}
          >
            Add to Order
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AddItemsModal;
