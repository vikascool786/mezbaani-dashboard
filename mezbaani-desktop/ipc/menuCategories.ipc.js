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

ipcMain.handle("sync:menuCategories", async () => {
  const db = getDB();
  const token = getToken();
  const res = await fetch(
    `${appUrl}/menu-categories`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { categories } = await res.json();
  console.log("categories", categories)
  if (!Array.isArray(categories)) {
    throw new Error("Invalid MenuCategories API response");
  }

  const stmt = db.prepare(`
    INSERT INTO MenuCategories (
      id,
      name,
      isActive,
      createdAt,
      updatedAt,
      restaurantId
    ) VALUES (
      @id,
      @name,
      @isActive,
      @createdAt,
      @updatedAt,
      @restaurantId
    )
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      isActive=excluded.isActive,
      updatedAt=excluded.updatedAt,
      restaurantId=excluded.restaurantId
  `);

  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    for (const t of categories) {
      stmt.run({
        id: t.id,
        name: t.name,
        isActive: t.isActive ? 1 : 0,
        createdAt: t.createdAt,
        updatedAt: now,
        restaurantId: t.restaurantId,
      });
    }
  });

  tx();

  return {
    success: true,
    synced: categories.length,
  };
});

ipcMain.handle("db:getMenuCategories", () => {
  const db = getDB();
  return db
    .prepare(`
      SELECT *
      FROM MenuCategories
    `)
    .all();
});
