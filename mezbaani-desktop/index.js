const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { initDatabase } = require("./db/db.js");
const registerIpcHandlers = require("./ipc");
const { registerNetworkIPC } = require("./ipc/network");


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: false,          // 🔥 REQUIRED
      nodeIntegration: false   // good practice
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
let dbInitialized = false;
app.setName("mezbaani-desktop");
app.setAppUserModelId("com.vitsolutions.mezbaani");
app.whenReady().then(() => {
  try {

    // Initialize SQLite FIRST
    if (!dbInitialized) {
      initDatabase();
      console.log("Database initialized");
      dbInitialized = true;
    }

    // Then open UI
    registerIpcHandlers();
    registerNetworkIPC(ipcMain);
    createWindow();
  } catch (err) {
    console.error("Failed to start app:", err);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});