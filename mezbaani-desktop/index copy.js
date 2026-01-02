const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fetch = require("node-fetch"); // npm install node-fetch@2
const { initDatabase, getDB } = require("./db/db.js");

/* ----------------------------------
   IPC HANDLERS (REGISTER ONCE)
----------------------------------- */
let isSyncingTables = false;
let appUrl = 'https://vitsolutions24x7.com/mezbaani/api';

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


//fetch users
//logged in flow
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
// ipcMain.handle("sync:users", async (_event, token) => {
//   const db = getDB();

//   const res = await fetch(
//     `${appUrl}/users`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   const users = await res.json();

//   if (!Array.isArray(users)) {
//     throw new Error("Invalid users API response");
//   }

//   const stmt = db.prepare(`
//     INSERT OR REPLACE INTO users (
//       id, name, email, phone,password, profileImage, isVerified, verificationToken,
//       roleId, restaurantId, createdAt, updatedAt
//     ) VALUES (
//       @id, @name, @email, @phone, @password, @profileImage, @isVerified, @verificationToken,
//       @roleId, @restaurantId, @createdAt, @updatedAt
//     )
//   `);

//   const insertMany = db.transaction((rows) => {
//     for (const u of rows) {
//       stmt.run({
//         id: u.id,
//         name: u.name,
//         email: u.email,
//         phone: u.phone,
//         roleId: u.roleId,
//         password: u.password,
//         profileImage: u.profileImage,
//         restaurantId: u.restaurantId,
//         isVerified: u.isVerified,
//         verificationToken: u.verificationToken,
//         createdAt: u.createdAt,
//         updatedAt: u.updatedAt,
//       });
//     }
//   });

//   insertMany(users);

//   return { success: true, synced: users.length };
// });
// ipcMain.handle("db:getUsers", () => {
//   const db = getDB();
//   return db.prepare("SELECT * FROM users").all();
// });

ipcMain.handle("sync:dashboardTables", async (_event, restaurantId) => {
  const db = getDB();

  const session = db
    .prepare(`SELECT token FROM auth_session WHERE id = 1`)
    .get();

  console.log("🪪 Token used for dashboard sync:", session);
  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    `${appUrl}/dashboard/tables/${restaurantId}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );

  const { tables } = await res.json();

  if (!Array.isArray(tables)) {
    throw new Error("Invalid tables API response");
  }

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
        duration: t.duration,
        customerName: t.customerName,
        amount: t.amount,
        reservationTime: t.reservationTime,
        updatedAt: now,
      });
    }
  });

  tx();

  return {
    success: true,
    synced: tables.length,
  };
});

ipcMain.handle("db:getDashboardTables", (_e, restaurantId) => {
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

// get restaurants and sync
ipcMain.handle("sync:restaurants", async (_event, token) => {
  if (!token) throw new Error("Token missing");

  const db = getDB();

  const response = await fetch(
    `${appUrl}/restaurants`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await response.json();
  const restaurants = json; // your API returns array

  if (!Array.isArray(restaurants)) {
    throw new Error("Invalid restaurant API response");
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO restaurants (
      id,
      name,
      location,
      phone,
      address,
      logo,
      user_id,
      gstPercent,
      serviceChargePercent,
      defaultDiscountPercent,
      isGstEnabled,
      isServiceChargeEnabled,
      createdAt,
      updatedAt
    ) VALUES (
      @id,
      @name,
      @location,
      @phone,
      @address,
      @logo,
      @user_id,
      @gstPercent,
      @serviceChargePercent,
      @defaultDiscountPercent,
      @isGstEnabled,
      @isServiceChargeEnabled,
      @createdAt,
      @updatedAt
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      stmt.run({
        id: r.id,
        name: r.name,
        location: r.location,
        phone: r.phone,
        address: r.address,
        logo: r.logo,
        user_id: r.user_id,

        gstPercent: Number(r.gstPercent),
        serviceChargePercent: Number(r.serviceChargePercent),
        defaultDiscountPercent: Number(r.defaultDiscountPercent),

        isGstEnabled: r.isGstEnabled ? 1 : 0,
        isServiceChargeEnabled: r.isServiceChargeEnabled ? 1 : 0,

        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      });
    }
  });

  insertMany(restaurants);

  return {
    success: true,
    synced: restaurants.length,
  };
});

ipcMain.handle("db:getRestaurants", () => {
  const db = getDB();
  return db.prepare("SELECT * FROM restaurants").all();
});


// List SQLite tables (debug)
ipcMain.handle("db:getTables", () => {
  const db = getDB();
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
});

// Read orders (later use)
ipcMain.handle("db:getOrders", () => {
  const db = getDB();
  return db.prepare("SELECT * FROM orders").all();
});

/* ----------------------------------
   MASTER SYNC: TABLES
----------------------------------- */

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


/* ----------------------------------
   WINDOW CREATION
----------------------------------- */
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "react-build/index.html"));
  }
}

/* ----------------------------------
   APP BOOTSTRAP
----------------------------------- */
app.whenReady().then(() => {
  try {
    console.log("🚀 App ready");
    console.log("📂 userData:", app.getPath("userData"));

    // ✅ Initialize SQLite FIRST
    initDatabase();

    console.log("✅ Database initialized");

    // ✅ Then open UI
    createWindow();
  } catch (err) {
    console.error("❌ Failed to start app:", err);
  }
});
