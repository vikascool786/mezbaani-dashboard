const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

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

ipcMain.handle("sync:orders", async () => {
  const db = getDB();
  const token = getToken();

  const res = await fetch(`${appUrl}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const orders = await res.json();

  console.log("Fetched orders:", orders);

  if (!Array.isArray(orders)) {
    throw new Error("Invalid orders API response");
  }

  const stmt = db.prepare(`
    INSERT INTO orders (
      id,
      status,
      orderNumber,
      subtotal,
      taxAmount,
      total,
      discountType,
      discountValue,
      serviceCharge,
      gstPercent,
      openedAt,
      createdAt,
      updatedAt,
      restaurantId,
      tableId,
      userId
    ) VALUES (
      @id,
      @status,
      @orderNumber,
      @subtotal,
      @taxAmount,
      @total,
      @discountType,
      @discountValue,
      @serviceCharge,
      @gstPercent,
      @openedAt,
      @createdAt,
      @updatedAt,
      @restaurantId,
      @tableId,
      @userId
    )
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status,
      orderNumber=excluded.orderNumber,
      subtotal=excluded.subtotal,
      taxAmount=excluded.taxAmount,
      total=excluded.total,
      serviceCharge=excluded.serviceCharge,
      gstPercent=excluded.gstPercent,
      openedAt=excluded.openedAt,
      updatedAt=excluded.updatedAt,
      restaurantId=excluded.restaurantId,
      tableId=excluded.tableId,
      userId=excluded.userId
  `);

  const tx = db.transaction(() => {
    for (const o of orders) {
      stmt.run({
        id: o.id,
        status: o.status,
        orderNumber: o.orderNumber,
        subtotal: Number(o.subtotal || 0),
        taxAmount: Number(o.taxAmount || 0),
        total: Number(o.total || 0),
        serviceCharge: Number(o.serviceCharge || 0),
        gstPercent: Number(o.gstPercent || 0),
        openedAt: o.openedAt,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        restaurantId: o.restaurantId,
        tableId: o.tableId,
        userId: o.userId,
      });
    }
  });

  tx();

  return {
    success: true,
    synced: orders.length,
  };
});

// Sync a single order by tableId from backend, upsert into orders, replace OrderItems
ipcMain.handle("sync:orderByTable", async (event, tableId) => {
  if (!tableId) throw new Error("tableId is required");

  const db = getDB();
  const token = getToken();

  const res = await fetch(`${appUrl}/orders/table/${tableId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order for table ${tableId}`);
  }

  const order = await res.json();
  if (!order) return null;

  const discount = normalizeDiscount(order);

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id,
      status,
      orderNumber,
      subtotal,
      taxAmount,
      total,
      discountType,
      discountValue,
      serviceCharge,
      gstPercent,
      openedAt,
      closedAt,
      createdAt,
      updatedAt,
      restaurantId,
      tableId,
      userId
    ) VALUES (
      @id,
      @status,
      @orderNumber,
      @subtotal,
      @taxAmount,
      @total,
      @discountType,
      @discountValue,
      @serviceCharge,
      @gstPercent,
      @openedAt,
      @closedAt,
      @createdAt,
      @updatedAt,
      @restaurantId,
      @tableId,
      @userId
    )
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status,
      subtotal=excluded.subtotal,
      taxAmount=excluded.taxAmount,
      total=excluded.total,
      discountType=excluded.discountType,
      discountValue=excluded.discountValue,
      serviceCharge=excluded.serviceCharge,
      gstPercent=excluded.gstPercent,
      updatedAt=excluded.updatedAt
  `);

  const deleteItems = db.prepare(`
    DELETE FROM OrderItems WHERE orderId = ?
  `);

  const insertItem = db.prepare(`
    INSERT INTO OrderItems (
      orderId,
      menuItemId,
      quantity,
      originalQuantity,
      quantityPrinted,
      quantityServed,
      quantityCancelled,
      createdAt,
      updatedAt
    ) VALUES (
      @orderId,
      @menuItemId,
      @quantity,
      @originalQuantity,
      @quantityPrinted,
      @quantityServed,
      @quantityCancelled,
      @createdAt,
      @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    insertOrder.run({
      id: order.id,
      status: order.status,
      orderNumber: order.orderNumber,
      subtotal: Number(order.subtotal || 0),
      taxAmount: Number(order.taxAmount || 0),
      total: Number(order.total || 0),
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      serviceCharge: Number(order.serviceCharge || 0),
      gstPercent: Number(order.gstPercent || 0),
      openedAt: order.openedAt,
      closedAt: order.closedAt || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurantId: order.restaurantId,
      tableId: order.tableId,
      userId: order.userId,
    });

    deleteItems.run(order.id);

    for (const item of order.items || []) {
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
  });

  tx();

  return { success: true, orderId: order.id };
});

ipcMain.handle("sync:getOrderByTable", async (event, tableId) => {
  if (!tableId) throw new Error("tableId is required");

  const db = getDB();
  const token = getToken();

  const res = await fetch(`${appUrl}/orders/table/${tableId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order for table ${tableId}`);
  }

  const order = await res.json();
  if (!order) return null;

  const discount = normalizeDiscount(order);

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id,
      status,
      orderNumber,
      subtotal,
      taxAmount,
      total,
      discountType,
      discountValue,
      serviceCharge,
      gstPercent,
      openedAt,
      closedAt,
      createdAt,
      updatedAt,
      restaurantId,
      tableId,
      userId
    ) VALUES (
      @id,
      @status,
      @orderNumber,
      @subtotal,
      @taxAmount,
      @total,
      @discountType,
      @discountValue,
      @serviceCharge,
      @gstPercent,
      @openedAt,
      @closedAt,
      @createdAt,
      @updatedAt,
      @restaurantId,
      @tableId,
      @userId
    )
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status,
      subtotal=excluded.subtotal,
      taxAmount=excluded.taxAmount,
      total=excluded.total,
      discountType=excluded.discountType,
      discountValue=excluded.discountValue,
      serviceCharge=excluded.serviceCharge,
      gstPercent=excluded.gstPercent,
      updatedAt=excluded.updatedAt
  `);

  const deleteItems = db.prepare(`
    DELETE FROM OrderItems WHERE orderId = ?
  `);

  const insertItem = db.prepare(`
    INSERT INTO OrderItems (
      orderId,
      menuItemId,
      quantity,
      originalQuantity,
      quantityPrinted,
      quantityServed,
      quantityCancelled,
      createdAt,
      updatedAt
    ) VALUES (
      @orderId,
      @menuItemId,
      @quantity,
      @originalQuantity,
      @quantityPrinted,
      @quantityServed,
      @quantityCancelled,
      @createdAt,
      @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    insertOrder.run({
      id: order.id,
      status: order.status,
      orderNumber: order.orderNumber,
      subtotal: Number(order.subtotal || 0),
      taxAmount: Number(order.taxAmount || 0),
      total: Number(order.total || 0),
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      serviceCharge: Number(order.serviceCharge || 0),
      gstPercent: Number(order.gstPercent || 0),
      openedAt: order.openedAt,
      closedAt: order.closedAt || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurantId: order.restaurantId,
      tableId: order.tableId,
      userId: order.userId,
    });

    deleteItems.run(order.id);

    for (const item of order.items || []) {
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
  });

  tx();

  return { success: true, orderId: order.id };
});

ipcMain.handle("db:createOrder", (event, payload) => {
  const db = getDB();
  const now = new Date().toISOString();
  const orderId = payload.id || require("crypto").randomUUID();

  const stmt = db.prepare(`
    INSERT INTO orders (
      id,
      status,
      orderNumber,
      subtotal,
      taxAmount,
      total,
      discountType,
      discountValue,
      serviceCharge,
      gstPercent,
      openedAt,
      createdAt,
      updatedAt,
      restaurantId,
      tableId,
      userId
    ) VALUES (
      @id,
      'OPEN',
      @orderNumber,
      @subtotal,
      @taxAmount,
      @total,
      @discountType,
      @discountValue,
      @serviceCharge,
      @gstPercent,
      @openedAt,
      @createdAt,
      @updatedAt,
      @restaurantId,
      @tableId,
      @userId
    )
  `);

  const insertItem = db.prepare(`
    INSERT INTO OrderItems (
      orderId,
      menuItemId,
      quantity,
      originalQuantity,
      quantityPrinted,
      quantityServed,
      quantityCancelled,
      createdAt,
      updatedAt
    ) VALUES (
      @orderId,
      @menuItemId,
      @quantity,
      @originalQuantity,
      0,
      0,
      0,
      @createdAt,
      @updatedAt
    )
  `);

  const tx = db.transaction(() => {
    stmt.run({
      id: orderId,
      orderNumber:
        payload.orderNumber ||
        `ORD-${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`,
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

    for (const item of payload.items || []) {
      insertItem.run({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        originalQuantity: item.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  tx();

  return {
    id: orderId,
    status: "OPEN",
    tableId: payload.tableId,
  };
});

ipcMain.handle("db:getOrders", () => {
  const db = getDB();
  return db
    .prepare(
      `
    SELECT
      id,
      subtotal,
      taxAmount,
      total,
      serviceCharge,
      gstPercent,
      openedAt,
      tableId,
      restaurantId,
      userId,
      orderNumber,
      status,
      updatedAt,
      createdAt
    FROM orders
    ORDER BY openedAt DESC
  `
    )
    .all();
});

ipcMain.handle("db:getOrderByTable", (event, tableId) => {
  const db = getDB();

  const order = db
    .prepare(
      `
    SELECT
      id,
      status,
      orderNumber,
      subtotal,
      taxAmount,
      total,
      discountType,
      discountValue,
      serviceCharge,
      gstPercent,
      openedAt,
      closedAt,
      createdAt,
      updatedAt,
      restaurantId,
      tableId,
      userId
    FROM orders
    WHERE tableId = ?
      AND status = 'OPEN'
    ORDER BY openedAt DESC
    LIMIT 1
  `
    )
    .get(tableId);

  if (!order) return null;

  const items = db
    .prepare(
      `
    SELECT
      oi.menuItemId,
      mi.name,
      mi.price,
      oi.quantity,
      oi.quantityServed,
      oi.quantityCancelled
    FROM OrderItems oi
    JOIN MenuItems mi
      ON mi.id = oi.menuItemId
    WHERE oi.orderId = ?
  `
    )
    .all(order.id);

  return {
    ...order,
    items,
  };
});

ipcMain.handle("db:sendToKot", async (event, orderId, items) => {
  // For now, this is a NO-OP handler to unblock KOT flow.
  // Later this can:
  // - persist KOT prints
  // - send to printer
  // - sync with backend

  if (!orderId) {
    throw new Error("orderId is required for KOT");
  }

  if (!Array.isArray(items)) {
    throw new Error("items must be an array");
  }

  return {
    success: true,
    orderId,
    printedAt: new Date().toISOString(),
  };
});

ipcMain.handle("db:updateOrder", (event, orderId, payload) => {
  if (!orderId) {
    throw new Error("orderId is required to update order");
  }

  const db = getDB();
  const now = new Date().toISOString();

  const upsertItem = db.prepare(`
    INSERT INTO OrderItems (
      orderId,
      menuItemId,
      quantity,
      originalQuantity,
      quantityPrinted,
      quantityServed,
      quantityCancelled,
      createdAt,
      updatedAt
    ) VALUES (
      @orderId,
      @menuItemId,
      @quantity,
      @originalQuantity,
      COALESCE(
        (SELECT quantityPrinted FROM OrderItems WHERE orderId=@orderId AND menuItemId=@menuItemId),
        0
      ),
      COALESCE(
        (SELECT quantityServed FROM OrderItems WHERE orderId=@orderId AND menuItemId=@menuItemId),
        0
      ),
      COALESCE(
        (SELECT quantityCancelled FROM OrderItems WHERE orderId=@orderId AND menuItemId=@menuItemId),
        0
      ),
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(orderId, menuItemId) DO UPDATE SET
      quantity=excluded.quantity,
      updatedAt=excluded.updatedAt
  `);

  const stmt = db.prepare(`
    UPDATE orders
    SET
      subtotal      = COALESCE(@subtotal, subtotal),
      taxAmount     = COALESCE(@taxAmount, taxAmount),
      total         = COALESCE(@total, total),
      discountType  = COALESCE(@discountType, discountType),
      discountValue = COALESCE(@discountValue, discountValue),
      serviceCharge = COALESCE(@serviceCharge, serviceCharge),
      gstPercent    = COALESCE(@gstPercent, gstPercent),
      updatedAt     = @updatedAt
    WHERE id = @id
  `);

  const tx = db.transaction(() => {
    stmt.run({
      id: orderId,
      subtotal:
        payload.subtotal !== undefined ? Number(payload.subtotal) : null,
      taxAmount:
        payload.taxAmount !== undefined ? Number(payload.taxAmount) : null,
      total:
        payload.total !== undefined ? Number(payload.total) : null,
      discountType: payload.discountType ?? null,
      discountValue:
        payload.discountValue !== undefined ? Number(payload.discountValue) : null,
      serviceCharge:
        payload.serviceCharge !== undefined
          ? Number(payload.serviceCharge)
          : null,
      gstPercent:
        payload.gstPercent !== undefined ? Number(payload.gstPercent) : null,
      updatedAt: now,
    });

    for (const item of payload.items || []) {
      upsertItem.run({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        originalQuantity: item.quantity,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  tx();

  return {
    success: true,
    orderId,
    updatedAt: now,
  };
});
