module.exports = function registerIpcHandlers() {
  require("./auth.ipc");
  require("./roles.ipc");
  require("./restaurants.ipc");
  require("./dashboardTables.ipc");
  require("./tables.ipc");
  require("./debug.ipc");
  require("./menuItems.ipc");
  require("./menuCategories.ipc");
};
