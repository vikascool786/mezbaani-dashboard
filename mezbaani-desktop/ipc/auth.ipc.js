const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";

ipcMain.handle("auth:login", async (_e, credentials) => {
  const res = await fetch(`${appUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  const db = getDB();

  db.prepare(`DELETE FROM auth_session`).run();
  db.prepare(`
    INSERT INTO auth_session
    (id, token, userId, name, phone, email, roleName, loggedInAt)
    VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    data.token,
    data.user.id,
    data.user.name,
    data.user.phone,
    data.user.email,
    data.user.roleName
  );

  return data;
});


ipcMain.handle("auth:getSession", () => {
  const db = getDB();
  const session = db.prepare(`SELECT * FROM auth_session WHERE id = 1`).get();
  return session;
});


ipcMain.handle("auth:logout", () => {
  const db = getDB();
  db.prepare(`DELETE FROM auth_session`).run();
  return true;
});