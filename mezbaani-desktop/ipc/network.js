// ipc/network.js (recommended file)
const dns = require("dns");

module.exports.registerNetworkIPC = (ipcMain) => {
  ipcMain.handle("network:isOnline", async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      await fetch("https://www.google.com/", {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  });
};

