const { contextBridge, ipcRenderer } = require("electron");
const dns = require("dns");
contextBridge.exposeInMainWorld("electron", {
  ping: () => ipcRenderer.invoke("ping")
});

contextBridge.exposeInMainWorld("posAPI", {
  /* ======================
      AUTH
   ====================== */
  getAuthSession: () => ipcRenderer.invoke("auth:getSession"),
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  logout: () => ipcRenderer.invoke("auth:logout"),

  /* ======================
     MASTER DATA
  ====================== */
  syncRoles: (token) => ipcRenderer.invoke("sync:roles", token),
  syncRestaurants: (token) => ipcRenderer.invoke("sync:restaurants"),
  syncTables: () => ipcRenderer.invoke("sync:tables"),

  getRoles: () => ipcRenderer.invoke("db:getRoles"),
  getTables: () => ipcRenderer.invoke("db:getTables"),
  getRestaurants: () => ipcRenderer.invoke("db:getRestaurants"),

  /* ======================
     ORDERS
  ====================== */
  getOrders: () => ipcRenderer.invoke("db:getOrders"),
  getOrderByTable: (tableId) => ipcRenderer.invoke("db:getOrderByTable", tableId),
  getOrderById: (orderId) => ipcRenderer.invoke("db:getOrderById", orderId),
  createOrder: (payload) => ipcRenderer.invoke("db:createOrder", payload),
  updateOrder: (orderId, payload) => ipcRenderer.invoke("db:updateOrder", orderId, payload),
  sendToKot: (orderId, items) => ipcRenderer.invoke("db:sendToKot", orderId, items),
  closeBill: (orderId, payload) => ipcRenderer.invoke("db:closeBill", orderId, payload),

  /* ======================
     ORDER SYNC
  ====================== */
  syncOrders: () => ipcRenderer.invoke("sync:orders"),
  syncOrderByTable: (tableId) => ipcRenderer.invoke("sync:orderByTable", tableId),
  syncGetOrderByTable: (tableId) => ipcRenderer.invoke("sync:getOrderByTable", tableId),
  updateOrderItem: (orderId, payload) => ipcRenderer.invoke("db:updateOrderItem", orderId, payload),
  syncCloseBill: (orderId, payload) => ipcRenderer.invoke("db:closeBill", orderId, payload),

  /* ======================
    MENU
 ====================== */
  getMenuCategories: () => ipcRenderer.invoke("db:getMenuCategories"),
  syncMenuCategories: () => ipcRenderer.invoke("sync:menuCategories"),

  getMenuItems: () => ipcRenderer.invoke("db:getMenuItems"),
  syncMenuItems: () => ipcRenderer.invoke("sync:menuItems"),


  /* ======================
   DASHBOARD TABLES (NEW)
====================== */
  // ONE-TIME bootstrap (server → sqlite)
  bootstrapDashboardTables: (restaurantId) => ipcRenderer.invoke("bootstrap:bootstrapDashboardTables", restaurantId),
  // recompute from LOCAL orders (after create/update/close)
  recompute: (restaurantId) => ipcRenderer.invoke("dashboard:recompute", restaurantId),
  // read for UI
  getDashboardTables: (restaurantId) => ipcRenderer.invoke("db:getDashboardTables", restaurantId),

  
  /* ======================
      NETWORK
   ====================== */
  isOnline: () => ipcRenderer.invoke("network:isOnline"),

  /* ======================
     PRINTING
  ====================== */
  printReceipt: (data) => ipcRenderer.invoke("print:receipt", data),
});