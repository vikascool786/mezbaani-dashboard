const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");
const { queueWrite } = require("../db/writeQueue");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";

function getToken() {
  const session = getDB()
    .prepare(`SELECT token FROM auth_session WHERE id = 1`)
    .get();

  if (!session?.token) throw new Error("Not authenticated");
  return session.token;
}

function normalizeDiscount(order) {
  if (order.discountType == null && order.discountValue == null) {
    return {
      discountType: "FLAT",
      discountValue: 0,
    };
  }
  return {
    discountType: order.discountType,
    discountValue: Number(order.discountValue || 0),
  };
}

// Helper: Get Order by Table ID from Local DB
function getOrderByTableLocal(tableId) {
  const db = getDB();
  const order = db.prepare(`
    SELECT * FROM orders 
    WHERE tableId = ? AND (status = 'OPEN' OR status IS NULL)
    ORDER BY openedAt DESC LIMIT 1
  `).get(tableId);

  if (!order) return null;

  const items = db.prepare(`
    SELECT oi.*, mi.name, mi.price 
    FROM OrderItems oi
    JOIN MenuItems mi ON mi.id = oi.menuItemId
    WHERE oi.orderId = ?
  `).all(order.id);

  return { ...order, items };
}

// Helper: Get Order by ID from Local DB
function getOrderByIdLocal(orderId) {
  const db = getDB();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;

  const items = db.prepare(`
    SELECT oi.*, mi.name, mi.price 
    FROM OrderItems oi
    JOIN MenuItems mi ON mi.id = oi.menuItemId
    WHERE oi.orderId = ?
  `).all(orderId);

  return { ...order, items };
}

// Helper: Shared Logic for Syncing Order by Table
async function syncOrderByTableLogic(tableId) {
  if (!tableId) throw new Error("tableId is required");

  const db = getDB();
  const token = getToken();

  // 1. Fetch from Server
  const res = await fetch(`${appUrl}/orders/${tableId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch order for table ${tableId}`);

  const order = await res.json();
  if (!order) return null;

  const discount = normalizeDiscount(order);
  const normalizedStatus = order.status ? order.status.toUpperCase() : "OPEN";

  // 2. Update Local DB
  const tx = db.transaction(() => {
    // Upsert Order
    db.prepare(`
      INSERT INTO orders (
        id, status, orderNumber, subtotal, taxAmount, total,
        discountType, discountValue, serviceCharge, gstPercent,
        openedAt, closedAt, createdAt, updatedAt, restaurantId, tableId, userId,
        is_synced
      ) VALUES (
        @id, @status, @orderNumber, @subtotal, @taxAmount, @total,
        @discountType, @discountValue, @serviceCharge, @gstPercent,
        @openedAt, @closedAt, @createdAt, @updatedAt, @restaurantId, @tableId, @userId,
        1
      )
      ON CONFLICT(id) DO UPDATE SET
        status=excluded.status,
        subtotal=excluded.subtotal,
        total=excluded.total,
        updatedAt=excluded.updatedAt,
        is_synced=1
    `).run({
      ...order,
      status: normalizedStatus,
      ...discount,
      subtotal: Number(order.subtotal || 0),
      taxAmount: Number(order.taxAmount || 0),
      total: Number(order.total || 0),
      serviceCharge: Number(order.serviceCharge || 0),
      gstPercent: Number(order.gstPercent || 0),
    });

    // Replace Items
    db.prepare("DELETE FROM OrderItems WHERE orderId = ?").run(order.id);
    const insertItem = db.prepare(`
      INSERT INTO OrderItems (
        orderId, menuItemId, quantity, originalQuantity, quantityPrinted,
        quantityServed, quantityCancelled, createdAt, updatedAt, is_synced
      ) VALUES (@orderId, @menuItemId, @quantity, @originalQuantity, @quantityPrinted,
        @quantityServed, @quantityCancelled, @createdAt, @updatedAt, 1)
    `);

    for (const item of order.items || []) {
       const exists = db.prepare("SELECT 1 FROM MenuItems WHERE id = ?").get(item.menuItemId);
       if (exists) {
         insertItem.run({
           orderId: order.id,
           menuItemId: item.menuItemId,
           quantity: item.quantity,
           originalQuantity: item.quantity,
           quantityPrinted: item.quantityPrinted || 0,
           quantityServed: item.quantityServed || 0,
           quantityCancelled: item.quantityCancelled || 0,
           createdAt: item.createdAt || order.createdAt,
           updatedAt: item.updatedAt || order.updatedAt,
         });
       }
    }
  });

  tx();
  
  // 3. Return updated local data
  return getOrderByTableLocal(tableId);
}

// Helper: Mark a record as synced
function markSynced(table, id, isSynced = true, error = null) {
  const db = getDB();
  const status = isSynced ? 1 : 0;
  const err = error ? error.toString() : null;
  db.prepare(`UPDATE ${table} SET is_synced = ?, sync_error = ? WHERE id = ?`).run(status, err, id);
}

// ==========================================
//  IPC HANDLERS
// ==========================================

ipcMain.handle("sync:orders", async () => {
  const token = getToken();

  const res = await fetch(`${appUrl}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const orders = await res.json();
  if (!Array.isArray(orders)) throw new Error("Invalid orders API response");

  return queueWrite(() => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, status, orderNumber, subtotal, taxAmount, total, 
        discountType, discountValue, serviceCharge, gstPercent, 
        openedAt, createdAt, updatedAt, restaurantId, tableId, userId,
        is_synced
      ) VALUES (
        @id, @status, @orderNumber, @subtotal, @taxAmount, @total, 
        @discountType, @discountValue, @serviceCharge, @gstPercent, 
        @openedAt, @createdAt, @updatedAt, @restaurantId, @tableId, @userId,
        1
      )
      ON CONFLICT(id) DO UPDATE SET
        status=excluded.status,
        subtotal=excluded.subtotal,
        taxAmount=excluded.taxAmount,
        total=excluded.total,
        serviceCharge=excluded.serviceCharge,
        gstPercent=excluded.gstPercent,
        openedAt=excluded.openedAt,
        updatedAt=excluded.updatedAt,
        is_synced=1
    `);

    const tx = db.transaction(() => {
      for (const o of orders) {
        stmt.run({
          ...o,
          subtotal: Number(o.subtotal || 0),
          taxAmount: Number(o.taxAmount || 0),
          total: Number(o.total || 0),
          serviceCharge: Number(o.serviceCharge || 0),
          gstPercent: Number(o.gstPercent || 0),
          discountType: o.discountType || 'FLAT',
          discountValue: Number(o.discountValue || 0),
        });
      }
    });

    tx();
    return { success: true, synced: orders.length };
  });
});

// ✅ REGISTER BOTH HANDLERS TO FIX "No handler registered" ERROR
ipcMain.handle("sync:orderByTable", (event, tableId) => syncOrderByTableLogic(tableId));
ipcMain.handle("sync:getOrderByTable", (event, tableId) => syncOrderByTableLogic(tableId));

ipcMain.handle("db:createOrder", async (event, payload) => {
  const db = getDB();
  const now = new Date().toISOString();
  const orderId = payload.id || require("crypto").randomUUID();

  // 1. Write to Local DB (Source of Truth)
  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (
        id, status, orderNumber, subtotal, taxAmount, total,
        discountType, discountValue, serviceCharge, gstPercent,
        openedAt, createdAt, updatedAt, restaurantId, tableId, userId,
        is_synced
      ) VALUES (
        @id, 'OPEN', @orderNumber, @subtotal, @taxAmount, @total,
        @discountType, @discountValue, @serviceCharge, @gstPercent,
        @openedAt, @createdAt, @updatedAt, @restaurantId, @tableId, @userId,
        0
      )
    `).run({
      id: orderId,
      orderNumber: payload.orderNumber || `ORD-${Date.now()}`,
      subtotal: Number(payload.subtotal || 0),
      taxAmount: Number(payload.taxAmount || 0),
      total: Number(payload.total || 0),
      discountType: payload.discountType || "FLAT",
      discountValue: Number(payload.discountValue || 0),
      serviceCharge: Number(payload.serviceCharge || 0),
      gstPercent: Number(payload.gstPercent || 0),
      openedAt: payload.openedAt || now,
      createdAt: payload.createdAt || now,
      updatedAt: payload.updatedAt || now,
      restaurantId: payload.restaurantId,
      tableId: payload.tableId,
      userId: payload.userId,
    });

    const insertItem = db.prepare(`
      INSERT INTO OrderItems (
        orderId, menuItemId, quantity, originalQuantity, 
        quantityPrinted, quantityServed, quantityCancelled, 
        createdAt, updatedAt, is_synced
      ) VALUES (
        @orderId, @menuItemId, @quantity, @quantity, 
        0, 0, 0, 
        @createdAt, @updatedAt, 0
      )
    `);

    for (const item of payload.items || []) {
      insertItem.run({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  tx(); // Commit local write

  // 2. Attempt Background Sync
  try {
    const token = getToken();
    await fetch(`${appUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: orderId,
        tableId: payload.tableId,
        restaurantId: payload.restaurantId,
        userId: payload.userId,
        items: payload.items || [],
      }),
    });
    
    // 3. Mark as Synced on Success
    markSynced("orders", orderId, true);
    
  } catch (err) {
    console.warn("[ORDERS-IPC] Offline: createOrder queued", err.message);
    markSynced("orders", orderId, false, err.message);
  }

  // 4. Return the Local Order immediately
  return getOrderByIdLocal(orderId);
});

ipcMain.handle("db:updateOrder", async (event, orderId, payload) => {
  if (!orderId) throw new Error("orderId is required");
  const db = getDB();
  const now = new Date().toISOString();

  // 1. Local Update
  const tx = db.transaction(() => {
    // Update Order details
    db.prepare(`
      UPDATE orders
      SET
        subtotal = COALESCE(@subtotal, subtotal),
        taxAmount = COALESCE(@taxAmount, taxAmount),
        total = COALESCE(@total, total),
        discountType = COALESCE(@discountType, discountType),
        discountValue = COALESCE(@discountValue, discountValue),
        serviceCharge = COALESCE(@serviceCharge, serviceCharge),
        gstPercent = COALESCE(@gstPercent, gstPercent),
        updatedAt = @updatedAt,
        is_synced = 0
      WHERE id = @id
    `).run({
      id: orderId,
      subtotal: payload.subtotal,
      taxAmount: payload.taxAmount,
      total: payload.total,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      serviceCharge: payload.serviceCharge,
      gstPercent: payload.gstPercent,
      updatedAt: now,
    });

    // Upsert Items
    const upsertItem = db.prepare(`
      INSERT INTO OrderItems (
        orderId, menuItemId, quantity, originalQuantity,
        quantityPrinted, quantityServed, quantityCancelled,
        createdAt, updatedAt, is_synced
      ) VALUES (
        @orderId, @menuItemId, @quantity, @quantity,
        0, 0, 0, @now, @now, 0
      )
      ON CONFLICT(orderId, menuItemId) DO UPDATE SET
        quantity = excluded.quantity,
        updatedAt = excluded.updatedAt,
        is_synced = 0
    `);

    for (const item of payload.items || []) {
      upsertItem.run({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        now: now,
      });
    }
  });

  tx();

  return getOrderByIdLocal(orderId);
});

ipcMain.handle("db:updateOrderItem", async (event, orderId, payload) => {
  const { menuItemId, action, quantity = 1 } = payload || {};
  if (!orderId || !menuItemId) throw new Error("Missing params");

  const db = getDB();
  const now = new Date().toISOString();

  // 1. Local Update
  const tx = db.transaction(() => {
    const item = db.prepare("SELECT * FROM OrderItems WHERE orderId=? AND menuItemId=?").get(orderId, menuItemId);
    if (!item) throw new Error("Item not found");

    let { quantityServed, quantityCancelled } = item;
    if (action === "served") quantityServed += quantity;
    if (action === "cancelled") quantityCancelled += quantity;

    db.prepare(`
      UPDATE OrderItems 
      SET quantityServed=?, quantityCancelled=?, updatedAt=?, is_synced=0
      WHERE orderId=? AND menuItemId=?
    `).run(quantityServed, quantityCancelled, now, orderId, menuItemId);
  });
  
  tx();

  // 2. Background Sync
  try {
    const token = getToken();
    const body = action === "served" ? { quantityServed: quantity } : { quantityCancelled: quantity };
    
    await fetch(`${appUrl}/order-items/status/${orderId}/${menuItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

  } catch (err) {
    console.warn("[ORDERS-IPC] Offline: Item update queued");
  }

  return { success: true, orderId, menuItemId, action };
});

ipcMain.handle("db:closeBill", async (event, orderId, payload = {}) => {
  if (!orderId) throw new Error("orderId required");
  const db = getDB();
  const now = new Date().toISOString();

  // 1. Local Close
  db.prepare(`
    UPDATE orders SET status='CLOSED', closedAt=?, updatedAt=?, is_synced=0 WHERE id=?
  `).run(payload.closedAt || now, now, orderId);

  // 2. Background Sync Sequence
  try {
    const token = getToken();
    
    // A. Generate Bill
    await fetch(`${appUrl}/bill/${orderId}/generate`, {
       method: "POST", headers: { Authorization: `Bearer ${token}` } 
    });

    // B. Record Payment
    if (payload.amount) {
      await fetch(`${appUrl}/payment/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentMode: payload.paymentMode || 'CASH',
          amount: payload.amount,
        }),
      });
    }

    // C. Mark Synced
    markSynced("orders", orderId, true);

  } catch (err) {
    console.warn("[ORDERS-IPC] Offline: Close Bill queued");
    markSynced("orders", orderId, false, err.message);
  }

  return { success: true, orderId, status: "CLOSED" };
});

ipcMain.handle("db:getOrders", () => {
  return getDB().prepare(`
    SELECT * FROM orders ORDER BY openedAt DESC
  `).all();
});

ipcMain.handle("db:getOrderByTable", (event, tableId) => {
  return getOrderByTableLocal(tableId);
});

ipcMain.handle("db:getOrderById", (event, orderId) => {
  return getOrderByIdLocal(orderId);
});

ipcMain.handle("db:sendToKot", async (event, orderId, items) => {
  return { success: true, printedAt: new Date().toISOString() };
});