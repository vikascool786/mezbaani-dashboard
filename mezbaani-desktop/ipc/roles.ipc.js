const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";

// fetch roles
ipcMain.handle("sync:roles", async (_event, token) => {
  if (!token) throw new Error("Token missing");

  const db = getDB();

  const res = await fetch(`${appUrl}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  const roles = json.roles;

  if (!Array.isArray(roles)) {
    throw new Error("Invalid roles API response");
  }

  db.pragma("foreign_keys = OFF");

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO roles (
      id, 
      roleName,
      createdAt,
      updatedAt
    ) VALUES (
      @id,
      @roleName,
      @createdAt,
      @updatedAt
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const r of rows) stmt.run(r);
  });

  insertMany(roles);

  db.pragma("foreign_keys = ON");

  return { success: true, synced: roles.length };
});

ipcMain.handle("db:getRoles", () => {
  const db = getDB();
  return db.prepare("SELECT * FROM roles").all();
});
