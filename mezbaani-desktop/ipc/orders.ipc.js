const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";

// Read orders (later use)
ipcMain.handle("db:getOrders", () => {
  const db = getDB();
  return db.prepare("SELECT * FROM orders").all();
});
