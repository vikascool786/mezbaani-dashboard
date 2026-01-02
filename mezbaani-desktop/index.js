const { app, BrowserWindow } = require("electron");
const path = require("path");
const { initDatabase } = require("./db/db.js");
const registerIpcHandlers = require("./ipc");


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
    registerIpcHandlers();
    createWindow();
  } catch (err) {
    console.error("❌ Failed to start app:", err);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});