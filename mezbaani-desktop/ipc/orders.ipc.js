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
      discountValue: 0
    };
  }

  return {
    discountType: order.discountType,
    discountValue: Number(order.discountValue || 0)
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

  if (!Array.isArray(orders)) {
    throw new Error("Invalid orders API response");
  }

  db.pragma("foreign_keys = OFF");
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
      orderNumber=excluded.orderNumber,
      subtotal=excluded.subtotal,
      taxAmount=excluded.taxAmount,
      total=excluded.total,
      discountType=excluded.discountType,
      discountValue=excluded.discountValue,
      serviceCharge=excluded.serviceCharge,
      gstPercent=excluded.gstPercent,
      openedAt=excluded.openedAt,
      closedAt=excluded.closedAt,
      updatedAt=excluded.updatedAt,
      restaurantId=excluded.restaurantId,
      tableId=excluded.tableId,
      userId=excluded.userId
  `);

  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    for (const t of orders) {
      const { discountType, discountValue } = normalizeDiscount(t);
      stmt.run({
        id: t.id,
        status: t.status,
        orderNumber: t.orderNumber,
        subtotal: Number(t.subtotal),
        taxAmount: Number(t.taxAmount),
        total: Number(t.total),
        discountType,
        discountValue,
        serviceCharge: Number(t.serviceCharge || 0),
        gstPercent: Number(t.gstPercent || 0),
        openedAt: t.openedAt,
        closedAt: t.closedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        restaurantId: t.restaurantId,
        tableId: t.tableId,
        userId: t.userId
      });
    }
  });

  tx();
  db.pragma("foreign_keys = ON");

  return {
    success: true,
    synced: orders.length,
  };
});

// Read orders (later use)
ipcMain.handle("db:getOrders", () => {
  const db = getDB();
  return db.prepare("SELECT * FROM orders").all();
});
