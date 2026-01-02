const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

let isSyncingTables = false;
let appUrl = 'https://vitsolutions24x7.com/mezbaani/api';

ipcMain.handle("sync:tables", async () => {
  if (isSyncingTables) {
    return { success: false, message: "Sync already running" };
  }

  isSyncingTables = true;

  try {
    const db = getDB();

    const response = await fetch(
      `${appUrl}/tables/bbae0cc4-bea7-4fb1-aea0-9ca598be608f`,
      {
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZjNjYyYmE1LTYzNDktNDU0YS05NTczLTg4NWNjNGE0ZDEyNiIsInBob25lIjoiODg4ODg4ODg4MSIsInJvbGVOYW1lIjoiYWRtaW4iLCJpYXQiOjE3NjcxMDgyNzAsImV4cCI6MTc2NzcxMzA3MH0.YAO6QrzKOLy8MRfWEJI0HhIRwme5_zCw4uk00ljAHRM",
          "Content-Type": "application/json"
        }
      }
    );

    const json = await response.json();
    const tables = json.tables;

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
