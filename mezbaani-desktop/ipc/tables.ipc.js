const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

let isSyncingTables = false;
let appUrl = 'https://vitsolutions24x7.com/mezbaani/api';

function getToken() {
  const session = getDB()
    .prepare(`SELECT token FROM auth_session WHERE id = 1`)
    .get();

  if (!session?.token) throw new Error("Not authenticated");
  return session.token;
}


ipcMain.handle("sync:tables", async () => {
  const db = getDB();
  const token = getToken();
  if (isSyncingTables) {
    return { success: false, message: "Sync already running" };
  }

  isSyncingTables = true;

  try {

    const response = await fetch(
      `${appUrl}/tables/bbae0cc4-bea7-4fb1-aea0-9ca598be608f`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const json = await response.json();
    const tables = json.tables;
    console.log(tables);

    if (!Array.isArray(tables)) {
      throw new Error("Invalid API response");
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO tables (
        id, name, seats, section, isOccupied,
        userId, restaurantId, createdAt, updatedAt
      ) VALUES (
        @id, @name, @seats, @section, @isOccupied,
        @userId, @restaurantId, @createdAt, @updatedAt
      )
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        stmt.run({
          ...row,
          isOccupied: row.isOccupied ? 1 : 0
        });
      }
    });

    db.pragma("foreign_keys = OFF");
    insertMany(tables);
    db.pragma("foreign_keys = ON");

    return { success: true, synced: tables.length };
  } finally {
    isSyncingTables = false;
  }
});
