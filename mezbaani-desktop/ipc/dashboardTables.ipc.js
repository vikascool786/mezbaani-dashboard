const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");
const { queueWrite } = require("../db/writeQueue");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";

/* -----------------------------
   Helpers
------------------------------ */

function getToken() {
  const session = getDB()
    .prepare(`SELECT token FROM auth_session WHERE id = 1`)
    .get();

  if (!session?.token) throw new Error("Not authenticated");
  return session.token;
}

/* =========================================================
   1️⃣ BOOTSTRAP DASHBOARD TABLES (SERVER → LOCAL) – ONCE ONLY
   ========================================================= */
ipcMain.handle("bootstrap:bootstrapDashboardTables", async (_e, restaurantId) => {
  if (!restaurantId) throw new Error("restaurantId missing");

  const db = getDB();

  const existing = db
    .prepare(
      `SELECT COUNT(*) as c FROM dashboard_tables WHERE restaurantId = ?`
    )
    .get(restaurantId).c;

  if (existing > 0) {
    console.log("🟡 Dashboard already bootstrapped");
    return { skipped: true };
  }

  const token = getToken();
  const res = await fetch(
    `${appUrl}/dashboard/tables/${restaurantId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const { tables } = await res.json();
  console.log(tables);
  if (!Array.isArray(tables)) {
    throw new Error("Invalid dashboard tables API response");
  }

  return queueWrite(() => {
    const stmt = db.prepare(`
      INSERT INTO dashboard_tables (
        id, restaurantId, name, section, seats,
        status, isOccupied, duration, customerName, amount,
        source, lastComputedAt, updatedAt
      ) VALUES (
        @id, @restaurantId, @name, @section, @seats,
        @status, @isOccupied, @duration, @customerName, @amount,
        'SERVER', @now, @now
      )
    `);

    const now = new Date().toISOString();

    const tx = db.transaction(() => {
      for (const t of tables) {
        stmt.run({
          id: t.id,
          restaurantId,
          name: t.name,
          section: t.section ?? null,
          seats: t.seats ?? null,
          status: t.status,
          isOccupied: t.isOccupied ? 1 : 0,
          duration: t.duration ?? null,
          customerName: t.customerName ?? null,
          amount: t.amount ?? 0,
          now,
        });
      }
    });

    tx();
    return { success: true, bootstrapped: tables.length };
  });
});

/* =========================================================
   2️⃣ RECOMPUTE DASHBOARD TABLES (LOCAL SOURCE OF TRUTH)
   ========================================================= */
function recomputeDashboardTables(restaurantId) {
  const db = getDB();
  const now = new Date().toISOString();

  const tables = db
    .prepare(
      `SELECT id, name, section, seats FROM Tables WHERE restaurantId = ?`
    )
    .all(restaurantId);

  const update = db.prepare(`
    UPDATE dashboard_tables
    SET
      status=@status,
      isOccupied=@isOccupied,
      customerName=@customerName,
      amount=@amount,
      source='LOCAL',
      lastComputedAt=@now,
      updatedAt=@now
    WHERE id=@id
  `);

  const tx = db.transaction(() => {
    for (const table of tables) {
      const order = db
        .prepare(
          `
          SELECT total
          FROM orders
          WHERE tableId = ? AND status = 'OPEN'
          ORDER BY openedAt DESC
          LIMIT 1
        `
        )
        .get(table.id);

      update.run({
        id: table.id,
        status: order ? "OCCUPIED" : "VACANT",
        isOccupied: order ? 1 : 0,
        customerName: order ? "Guest" : null,
        amount: order ? order.total : 0,
        now,
      });
    }
  });

  tx();
}

/* =========================================================
   3️⃣ PUBLIC RECOMPUTE IPC (CALLED AFTER ORDER EVENTS)
   ========================================================= */
ipcMain.handle("dashboard:recompute", async (_e, restaurantId) => {
  if (!restaurantId) throw new Error("restaurantId missing");

  return queueWrite(() => {
    recomputeDashboardTables(restaurantId);
    return { success: true };
  });
});

/* =========================================================
   4️⃣ READ DASHBOARD TABLES (UI)
   ========================================================= */
ipcMain.handle("db:getDashboardTables", (_e, restaurantId) => {
  const db = getDB();
  return db
    .prepare(
      `
      SELECT *
      FROM dashboard_tables
      WHERE restaurantId = ?
      ORDER BY section, name
    `
    )
    .all(restaurantId);
});