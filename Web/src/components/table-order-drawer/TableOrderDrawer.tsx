import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { Order, OrderItem } from "../../types/Order";
import BillSummary from "./BillSummary";
import DrawerActions from "./DrawerActions";
import OrderItems from "./OrderItems";
import TableHeader from "./TableHeader";
// @ts-ignore: allow importing CSS as a side-effect without type declarations
import "./css/TableOrderDrawer.css";
import { MenuItem } from "../../types/MenuItem";
import OrderItemsSkeleton from "../../UI/skeleton/OrderItemsSkeleton";
import MenuPanel from "../Table/MenuPanel";
import PaymentPanel from "../Table/PaymentPanel";

interface Props {
  table: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (tableId: string) => void;
}

const TableOrderDrawer: React.FC<Props> = ({
  table,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const { apiCall } = useApi();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const isElectron = !!(window as any).posAPI;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // CLOSE BILL
  const [showCloseBill, setShowCloseBill] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "cash" | "upi" | "card" | null
  >(null);

  // MENU DATA
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [existingItems, setExistingItems] = useState<OrderItem[]>([]);
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // for searching menu items
  const lastCategoryRef = useRef<string | null>(null); // Store previous category:

  const hasOrder = !!order;
  const hasExistingItems = existingItems.length > 0;
  const hasDraftItems = draftItems.length > 0;

  // check all items served
  const allItemsServed = useMemo(() => {
    if (!existingItems.length) return false;

    return existingItems.every((item) => {
      const orderedQty = item.quantity || 0;
      const servedQty = item.quantityServed || 0;
      const cancelledQty = item.quantityCancelled || 0;

      return servedQty + cancelledQty >= orderedQty;
    });
  }, [existingItems]);

  // READ helpers
  const getOrderByTable = async (tableId: string) => {
    if (isElectron) {
      return (window as any).posAPI.getOrderByTable(tableId);
    }
    return apiCall(`${baseUrl}/orders/table/${tableId}`);
  };

  const getMenuItems = async () => {
    if (isElectron) {
      return (window as any).posAPI.getMenuItems();
    }
    const res = await apiCall(`${baseUrl}/menu-items`);
    return res.items || [];
  };

  // WRITE helpers
  const syncCreateOrder = async (payload: any) => {
    if (isElectron) {
      return (window as any).posAPI.createOrder(payload);
    }
    return apiCall(`${baseUrl}/orders`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const syncUpdateOrder = async (orderId: string, payload: any) => {
    if (isElectron) {
      return (window as any).posAPI.updateOrder(orderId, payload);
    }
    return apiCall(`${baseUrl}/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  const canCloseBill =
    hasOrder && hasExistingItems && !hasDraftItems && allItemsServed;

  const canPrintKot = hasDraftItems;

  const canTransfer = hasOrder && !hasDraftItems;

  const canMerge = hasOrder && !hasDraftItems;

  // fetch menu items and categories
  useEffect(() => {
    if (!isOpen) return;

    const fetchMenuItems = async () => {
      try {
        setMenuLoading(true);

        if (isElectron) {
          await (window as any).posAPI.syncMenuItems();
        }

        const items = await getMenuItems();

        setMenuItems(items);

        // 🔥 Extract unique categories from items
        const categoryMap = new Map();

        items.forEach((item: any) => {
          if (item.MenuCategory?.id && item.MenuCategory.isActive) {
            categoryMap.set(item.MenuCategory.id, item.MenuCategory);
          }
        });

        const categoryList = Array.from(categoryMap.values());
        setCategories(categoryList);

        // Default active category
        if (categoryList.length) {
          setActiveCategoryId(categoryList[0].id);
        }
      } catch (err) {
        console.error("Failed to load menu items", err);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuItems();
  }, [isOpen]);

  /* -------------------------
     FETCH MENU ITEMS
  ------------------------- */
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return menuItems.filter((item) => {
      const matchesCategory = activeCategoryId
        ? item.categoryId === activeCategoryId
        : true;

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);

      return (
        matchesCategory && matchesSearch && item.isActive && item.isAvailable
      );
    });
  }, [menuItems, activeCategoryId, searchTerm]);

  //Auto-clear category when searching
  useEffect(() => {
    if (searchTerm.length > 0) {
      if (lastCategoryRef.current === null) {
        lastCategoryRef.current = activeCategoryId;
        setActiveCategoryId(null);
      }
    } else {
      setActiveCategoryId(lastCategoryRef.current);
      lastCategoryRef.current = null; // reset after restore
    }
  }, [searchTerm]);

  // 🔍 Find item quantity in current order
  const getDraftQty = (menuItemId: string) => {
    return draftItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  };

  const handleAddItem = (menuItem: MenuItem) => {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem.id);

      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [
        ...prev,
        {
          orderId: "DRAFT",
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          quantityServed: 0,
          quantityCancelled: 0,
        },
      ];
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setDraftItems((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  // send items to KOT
  const buildItemsPayload = () =>
    draftItems.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
    }));

  const onPrintKot = async () => {
    if (!draftItems.length) return;
    setLoading(true);
    try {
      const itemsPayload = buildItemsPayload();
      let orderId = order?.id;

      // CASE 1: VACANT TABLE (NO ORDER)
      if (!orderId) {
        const res = await syncCreateOrder({
          tableId: table.id,
          items: itemsPayload,
        });
        orderId = res.id;
        setOrder(res);
      }

      // CASE 2: OCCUPIED TABLE
      else {
        await syncUpdateOrder(orderId, {
          tableId: table.id,
          items: itemsPayload,
        });
      }

      // 🔥 SEND TO KOT (COMMON)
      if (isElectron) {
        await (window as any).posAPI.sendToKot(orderId, itemsPayload);
      } else {
        await apiCall(`${baseUrl}/orders/${orderId}/kot`, {
          method: "PUT",
          body: JSON.stringify({ items: itemsPayload }),
        });
      }

      // ✅ RESET DRAFT AFTER SUCCESS
      setDraftItems([]);

      // 🔁 REFRESH ORDER (optional but recommended)
      const updatedOrder = await apiCall(`${baseUrl}/orders/${orderId}`);
      setOrder(updatedOrder);
      setExistingItems(updatedOrder?.items || []);
      // Notify parent about order update for tableView.tsx file
      onOrderUpdated?.(table.id);
    } catch (err) {
      console.error("KOT print failed", err);
    } finally {
      setLoading(false);
    }
  };

  // make final payment and close bill
  const confirmCloseBill = async () => {
    if (!order) return;

    if (isElectron) {
      await (window as any).posAPI.closeBill(order.id, {
        paymentMode: selectedMethod,
        amount: Number(order.total),
      });
      return;
    }

    try {
      setLoading(true);

      await apiCall(`${baseUrl}/bill/${order.id}/generate`, {
        method: "POST",
      });
      await apiCall(`${baseUrl}/payment/${order.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          paymentMode: selectedMethod,
          amount: Number(order.total),
        }),
      });

      // print logic goes here
      const printData = await apiCall(`${baseUrl}/orders/${order.id}/bill`);

      // // 🔁 Refresh table/order state in parent
      // onOrderUpdated?.(table.id);

      // // 🔒 Close drawer
      // onClose();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onTransfer = () => {
    //   openTransferModal(order.id, table.id);
  };
  const onMerge = () => {
    //   openTransferModal(order.id, table.id);
  };

  //refresh order once update on served or cancelled
  const refreshOrder = async () => {
    if (!table?.id) return;

    const data: Order = await getOrderByTable(table.id);

    setOrder(data);
    setExistingItems(data?.items || []);
  };

  // fetch order details on drawer open
  useEffect(() => {
    if (!isOpen || !table?.id) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data: Order = await getOrderByTable(table.id);

        setOrder(data);
        setExistingItems(data?.items || []);
        setDraftItems([]); // reset when drawer opens
        setSearchTerm(""); // reset input field
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isOpen, table?.id]);

  // order ITem component events
  const handleOrderItemAction = async (
    orderId: string,
    itemId: string,
    action: "served" | "cancelled",
    qty = 1
  ) => {
    if (!orderId && !itemId) return;
    try {
      const payload = {
        [action === "served" ? "quantityServed" : "quantityCancelled"]: qty,
      };

      setLoading(true);
      await apiCall(`${baseUrl}/order-items/status/${orderId}/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      //refresh order
      await refreshOrder();
    } catch (err) {
      console.error("Failed to fetch order", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) setOrder(null);
  }, [isOpen]);

  // RESET EVERYTHING WHEN DRAWER CLOSES
  useEffect(() => {
    if (isOpen) return;

    // 🔄 RESET EVERYTHING
    setOrder(null);
    setExistingItems([]);
    setDraftItems([]);

    setMenuItems([]);
    setCategories([]);
    setActiveCategoryId(null);

    setLoading(false);
    setMenuLoading(false);
  }, [isOpen]);

  if (!isOpen || !table) return null;

  return (
    <>
      {/* HEADER */}
      <div className="drawer-header">
        <TableHeader
          table={table}
          order={order}
          onClose={onClose}
          showCloseBill={showCloseBill}
        />
      </div>

      {/* MAIN SPLIT */}
      <div className="sidebar-wrapper-main">
        {/* LEFT MENU PANEL */}
        {!showCloseBill && (
          <MenuPanel
            isOpen={isOpen}
            menuItems={filteredItems}
            allMenuItems={menuItems}
            categories={categories}
            activeCategoryId={activeCategoryId}
            setActiveCategoryId={setActiveCategoryId}
            loading={menuLoading}
            getDraftQty={getDraftQty}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {/* ADD CLOSE BILL MODAL HERE */}
        {showCloseBill && (
          <PaymentPanel
            isOpen={true}
            totalAmount={Number(order?.total || 0)}
            onBack={() => setShowCloseBill(false)}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        )}

        {/* RIGHT ORDER PANEL (UNCHANGED) */}
        <aside className="drawer-root right-orderitem">
          <div className="drawer-content p-0">
            <div className="border-bottom section-title">ORDER HISTORY</div>
            <div className="drawer-items p-3">
              {!loading && !order && draftItems.length == 0 && (
                <div className="vacant-table-state text-center mt-5">
                  <i className="bi bi-plus-circle fs-1 text-muted" />
                  <h6 className="mt-3 fw-bold">Table is vacant</h6>
                  <p className="text-muted small">
                    Start a new order to add items
                  </p>
                  <button className="btn btn-primary btn-sm mt-2">
                    Start Order
                  </button>
                </div>
              )}

              {existingItems.length > 0 && (
                <>
                  <div className="order-section-title">Already Sent to KOT</div>
                  {loading && <OrderItemsSkeleton rows={3} />}
                  {!loading && (
                    <OrderItems
                      items={existingItems}
                      orderDetails={order}
                      onItemAction={handleOrderItemAction}
                    />
                  )}
                </>
              )}

              {draftItems.length > 0 && (
                <>
                  <div className="order-section-title new">
                    New Items
                    <span className="badge bg-warning text-dark ms-2">
                      Pending
                    </span>
                  </div>
                  {loading && <OrderItemsSkeleton rows={3} />}
                  {!loading && (
                    <OrderItems items={draftItems} draftItems={true} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="drawer-footer">
            <>
              {order ? (
                <div className="drawer-bill">
                  <BillSummary
                    bill={{
                      subtotal: Number(order.subtotal || 0),
                      gst: Number(order.taxAmount || 0),
                      gstPercent: Number(order.gstPercent || 0),
                      serviceCharge: Number(order.serviceCharge || 0),
                      total: Number(order.total || 0),
                    }}
                  />
                </div>
              ) : null}
              <div className="drawer-actions">
                <DrawerActions
                  onPrintKot={onPrintKot}
                  onCloseBill={() => setShowCloseBill(true)}
                  confirmCloseBill={confirmCloseBill}
                  onTransfer={onTransfer}
                  onMerge={onMerge}
                  disablePrintKot={!hasDraftItems}
                  disableCloseBill={!canCloseBill}
                  disableTransfer={!canTransfer}
                  disableMerge={!canMerge}
                  kotItems={draftItems}
                  existingItems={existingItems}
                  showCloseBill={showCloseBill}
                  selectedMethod={selectedMethod}
                />
              </div>
            </>
          </div>
        </aside>
      </div>
    </>
  );
};

export default TableOrderDrawer;
