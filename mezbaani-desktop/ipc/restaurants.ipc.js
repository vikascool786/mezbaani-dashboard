const { ipcMain } = require("electron");
const fetch = require("node-fetch");
const { getDB } = require("../db/db");

const appUrl = "https://vitsolutions24x7.com/mezbaani/api";


function getToken() {
  const session = getDB()
    .prepare(`SELECT token FROM auth_session WHERE id = 1`)
    .get();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  return session.token;
}

// get restaurants and sync
ipcMain.handle("sync:restaurants", async () => {
  const token = getToken();
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
