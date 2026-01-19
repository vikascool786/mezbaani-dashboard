const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

let db;

function initDatabase() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "pos.db");

  // Ensure directory exists (extra safety)
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // Open or create DB
  console.log(dbPath);
  db = new Database(dbPath, {
    timeout: 5000
  });

  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");
  // Enable foreign keys
  // db.pragma("foreign_keys = OFF");
  db.pragma("foreign_keys = ON");

  // Load schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");


  // Execute schema (safe to run multiple times)
  db.transaction(() => {
    db.exec(schema);
  })();


  console.log("✅ SQLite initialized at:", dbPath);

  return db;
}

function getDB() {
  if (!db) {
    throw new Error("❌ Database not initialized");
  }
  return db;
}

module.exports = {
  initDatabase,
  getDB
};
