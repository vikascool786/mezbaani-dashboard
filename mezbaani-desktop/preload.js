const { contextBridge, ipcRenderer } = require("electron");
const dns = require("dns");
contextBridge.exposeInMainWorld("electron", {
  ping: () => ipcRenderer.invoke("ping")
});

contextBridge.exposeInMainWorld("posAPI", {
  getAuthSession: () => ipcRenderer.invoke("auth:getSession"),
  getRoles: () => ipcRenderer.invoke("db:getRoles"),
  // getUsers: () => ipcRenderer.invoke("db:getUsers"),
  getTables: () => ipcRenderer.invoke("db:getTables"),
  getOrders: () => ipcRenderer.invoke("db:getOrders"),
  getRestaurants: () => ipcRenderer.invoke("db:getRestaurants"),
  getDashboardTables: (restaurantId) => ipcRenderer.invoke("db:getDashboardTables", restaurantId),
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  logout: () => ipcRenderer.invoke("auth:logout"),

  // ✅ NEW: master sync
  syncRoles: (token) => ipcRenderer.invoke("sync:roles", token),
  // syncUsers: (token) => ipcRenderer.invoke("sync:users", token),
  syncRestaurants: (token) => ipcRenderer.invoke("sync:restaurants"),
  syncTables: () => ipcRenderer.invoke("sync:tables"),
  syncDashboardTables: (restaurantId) => ipcRenderer.invoke("sync:dashboardTables", restaurantId),
  isOnline: () => ipcRenderer.invoke("network:isOnline"),
});