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
  getRestaurants: () => ipcRenderer.invoke("db:getRestaurants"),
  getDashboardTables: (restaurantId) => ipcRenderer.invoke("db:getDashboardTables", restaurantId),
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  logout: () => ipcRenderer.invoke("auth:logout"),
  //order
  getOrders: () => ipcRenderer.invoke("db:getOrders"),
  getOrderByTable: (tableId) =>
    ipcRenderer.invoke("db:getOrderByTable", tableId),
  createOrder: (payload) =>
    ipcRenderer.invoke("db:createOrder", payload),
  updateOrder: (orderId, payload) =>
    ipcRenderer.invoke("db:updateOrder", orderId, payload),
  sendToKot: (orderId, items) =>
    ipcRenderer.invoke("db:sendToKot", orderId, items),
  closeBill: (orderId, payload) =>
    ipcRenderer.invoke("db:closeBill", orderId, payload),
  syncOrders: () => ipcRenderer.invoke("sync:orders"),
  //menu categories
  getMenuCategories: () => ipcRenderer.invoke("db:getMenuCategories"),
  syncMenuCategories: () => ipcRenderer.invoke("sync:menuCategories"),
  //menu Items
  getMenuItems: () => ipcRenderer.invoke("db:getMenuItems"),
  syncMenuItems: () => ipcRenderer.invoke("sync:menuItems"),

  // master sync
  syncRoles: (token) => ipcRenderer.invoke("sync:roles", token),
  // syncUsers: (token) => ipcRenderer.invoke("sync:users", token),
  syncRestaurants: (token) => ipcRenderer.invoke("sync:restaurants"),
  syncTables: () => ipcRenderer.invoke("sync:tables"),
  syncDashboardTables: (restaurantId) => ipcRenderer.invoke("sync:dashboardTables", restaurantId),
  isOnline: () => ipcRenderer.invoke("network:isOnline"),

  //print solutions
  printReceipt: (data) => ipcRenderer.invoke("print:receipt", data)
});