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

ipcMain.handle("sync:menuItems", async () => {
  const db = getDB();
  db.pragma("foreign_keys = OFF");
  const token = getToken();
  const res = await fetch(`${appUrl}/menu-items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { items } = await res.json();
  if (!Array.isArray(items)) {
    throw new Error("Invalid menuItems API response");
  }

  const categoryExists = db.prepare(
    `SELECT 1 FROM MenuCategories WHERE id = ?`,
  );

  const stmt = db.prepare(`
    INSERT INTO MenuItems (
      id,
      name,
      description,
      foodType,
      price,
      imageUrl,
      isAvailable,
      isActive,
      sortOrder,
      restaurantId,
      categoryId,
      createdAt,
      updatedAt
    ) VALUES (
      @id,
      @name,
      @description,
      @foodType,
      @price,
      @imageUrl,
      @isAvailable,
      @isActive,
      @sortOrder,
      @restaurantId,
      @categoryId,
      @createdAt,
      @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      description=excluded.description,
      foodType=excluded.foodType,
      price=excluded.price,
      imageUrl=excluded.imageUrl,
      isAvailable=excluded.isAvailable,
      isActive=excluded.isActive,
      sortOrder=excluded.sortOrder,
      restaurantId=excluded.restaurantId,
      categoryId=excluded.categoryId,
      updatedAt=excluded.updatedAt
  `);

  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    for (const t of items) {
      // Skip items whose category is not yet synced
      if (t.categoryId) {
        const exists = categoryExists.get(t.categoryId);
        if (!exists) {
          console.warn(
            "[MENU-IPC] skipping MenuItem due to missing MenuCategory",
            { menuItemId: t.id, categoryId: t.categoryId }
          );
          continue;
        }
      }

      stmt.run({
        id: t.id,
        name: t.name,
        description: t.description,
        price: t.price,
        imageUrl: t.imageUrl,
        foodType: t.foodType,
        isAvailable: t.isAvailable ? 1 : 0,
        isActive: t.isActive ? 1 : 0,
        sortOrder: t.sortOrder,
        restaurantId: t.restaurantId,
        categoryId: t.categoryId,
        createdAt: t.createdAt,
        updatedAt: now,
      });
    }
  });

  tx();

  db.pragma("foreign_keys = ON");

  return {
    success: true,
    synced: items.length,
  };
});

ipcMain.handle("db:getMenuItems", () => {
  const db = getDB();

  const rows = db
    .prepare(
      `
      SELECT
        mi.*,
        mc.id           AS menuCategory_id,
        mc.name         AS menuCategory_name,
        mc.isActive     AS menuCategory_isActive,
        mc.createdAt    AS menuCategory_createdAt,
        mc.updatedAt    AS menuCategory_updatedAt,
        mc.restaurantId AS menuCategory_restaurantId
      FROM MenuItems mi
      LEFT JOIN MenuCategories mc
        ON mc.id = mi.categoryId
    `,
    )
    .all();

  return rows.map((row) => {
    const {
      menuCategory_id,
      menuCategory_name,
      menuCategory_isActive,
      menuCategory_createdAt,
      menuCategory_updatedAt,
      menuCategory_restaurantId,
      ...menuItem
    } = row;

    return {
      ...menuItem,
      MenuCategory: menuCategory_id
        ? {
            id: menuCategory_id,
            name: menuCategory_name,
            isActive: !!menuCategory_isActive,
            createdAt: menuCategory_createdAt,
            updatedAt: menuCategory_updatedAt,
            restaurantId: menuCategory_restaurantId,
          }
        : null,
    };
  });
});
