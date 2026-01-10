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

ipcMain.handle("sync:dashboardTables", async (_event, restaurantId) => {
  if (!restaurantId) throw new Error("restaurantId missing");

  // 1️⃣ FETCH (NO SQLITE HERE)
  const token = getToken(); // token must be in memory
  const res = await fetch(
    `${appUrl}/dashboard/tables/${restaurantId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const { tables } = await res.json();

  if (!Array.isArray(tables)) {
    throw new Error("Invalid dashboard tables response");
  }

  // 2️⃣ WRITE (SQLITE ONLY, SYNC)
  return queueWrite(() => {
    const db = getDB();
    const stmt = db.prepare(`
    INSERT INTO dashboard_tables (
      id,
      restaurantId,
      name,
      section,
      seats,
      status,
      isOccupied,
      duration,
      customerName,
      amount,
      reservationTime,
      updatedAt
    ) VALUES (
      @id,
      @restaurantId,
      @name,
      @section,
      @seats,
      @status,
      @isOccupied,
      @duration,
      @customerName,
      @amount,
      @reservationTime,
      @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      status=excluded.status,
      isOccupied=excluded.isOccupied,
      duration=excluded.duration,
      customerName=excluded.customerName,
      amount=excluded.amount,
      reservationTime=excluded.reservationTime,
      updatedAt=excluded.updatedAt
  `);

    const now = new Date().toISOString();

    const tx = db.transaction(() => {
      for (const t of tables) {
        stmt.run({
          id: t.id,
          restaurantId,
          name: t.name,
          section: t.section,
          seats: t.seats,
          status: t.status,
          isOccupied: t.isOccupied ? 1 : 0,
          duration: t.duration ?? null,
          customerName: t.customerName ?? null,
          amount: t.amount ?? 0,
          reservationTime: t.reservationTime ?? null,
          updatedAt: now,
        });
      }
    });

    try {
      tx();
    } catch (err) {
      throw new Error("Failed to sync dashboard tables: " + err.message);
    }

    return {
      success: true,
      synced: tables.length,
    };
  });
});

ipcMain.handle("db:getDashboardTables", (_e, restaurantId) => {
  return queueWrite(() => {
    const db = getDB();
    return db
      .prepare(`
      SELECT *
      FROM dashboard_tables
      WHERE restaurantId = ?
      ORDER BY section, name
    `)
      .all(restaurantId);
  });
});
