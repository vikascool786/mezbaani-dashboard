const { ipcMain } = require("electron");
const { getDB } = require("../db/db");

ipcMain.handle("db:getTables", () => {
  return getDB()
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
});
