const fetch = require("node-fetch");
const { createApiClient } = require("../shared/apiClient");

/*
  This file is Electron-only
  No React
  No hooks
*/

const apiClient = createApiClient({
  getToken: () => {
    const db = getDB();
    return db
      .prepare(`SELECT token FROM auth_session WHERE id = 1`)
      .get()?.token;
  },
  onUnauthorized: () => {
    console.log("🔐 Unauthorized – show login screen");
  },
});

module.exports = { apiClient };
