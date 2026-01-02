PRAGMA foreign_keys = ON;

/* =========================
   DASHBOARD TABLES
   ========================= */
CREATE TABLE IF NOT EXISTS dashboard_tables (
  id TEXT PRIMARY KEY,
  restaurantId TEXT NOT NULL,

  name TEXT NOT NULL,
  section TEXT,
  seats INTEGER,

  status TEXT CHECK(status IN ('VACANT','OCCUPIED','RESERVED')),
  isOccupied INTEGER DEFAULT 0,

  duration INTEGER,              -- minutes
  customerName TEXT,
  amount REAL,

  reservationTime TEXT,          -- ISO string
  updatedAt TEXT,

  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dashboard_tables_restaurant
ON dashboard_tables (restaurantId);

/* =========================
   AUTH SESSION (SINGLE USER)
   ========================= */
CREATE TABLE IF NOT EXISTS auth_session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  token TEXT NOT NULL,
  userId TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT,
  roleName TEXT,
  loggedInAt TEXT
);

/* =========================
   Restaurants
========================= */
CREATE TABLE IF NOT EXISTS Restaurants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  address TEXT,
  gstPercent REAL DEFAULT 0.0,
  serviceChargePercent REAL DEFAULT 0.0,
  isGstEnabled INTEGER DEFAULT 1,
  isServiceChargeEnabled INTEGER DEFAULT 1,
  defaultDiscountPercent REAL DEFAULT 0.0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

/* =========================
   Roles
========================= */
CREATE TABLE IF NOT EXISTS Roles (
  id TEXT PRIMARY KEY,
  roleName TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

/* =========================
   Users
========================= */
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password TEXT NOT NULL,
  profileImage TEXT,
  isVerified INTEGER DEFAULT 0,
  verificationToken TEXT,
  restaurantId TEXT,
  roleId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id),
  FOREIGN KEY (roleId) REFERENCES Roles(id)
);

/* =========================
   Tables (Restaurant Tables)
========================= */
CREATE TABLE IF NOT EXISTS Tables (
  id TEXT PRIMARY KEY,
  name TEXT,
  section TEXT,
  seats INTEGER,
  isOccupied INTEGER DEFAULT 0,
  userId TEXT,
  restaurantId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  UNIQUE (name, restaurantId),
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id)
);

/* =========================
   Menu Categories
========================= */
CREATE TABLE IF NOT EXISTS MenuCategories (
  id TEXT PRIMARY KEY,
  name TEXT,
  isActive INTEGER NOT NULL,
  restaurantId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  UNIQUE (name, restaurantId),
  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id)
);

/* =========================
   Menu Items
========================= */
CREATE TABLE IF NOT EXISTS MenuItems (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT NOT NULL,
  price REAL,
  imageUrl TEXT,
  foodType TEXT NOT NULL,
  isAvailable INTEGER DEFAULT 1,
  isActive INTEGER NOT NULL,
  sortOrder INTEGER NOT NULL,
  restaurantId TEXT,
  categoryId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id),
  FOREIGN KEY (categoryId) REFERENCES MenuCategories(id)
);

/* =========================
   Menu Item Variants
========================= */
CREATE TABLE IF NOT EXISTS MenuItemVariants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  isDefault INTEGER DEFAULT 0,
  isAvailable INTEGER DEFAULT 1,
  isActive INTEGER DEFAULT 1,
  sortOrder INTEGER DEFAULT 0,
  menuItemId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  FOREIGN KEY (menuItemId) REFERENCES MenuItems(id)
);

/* =========================
   Orders (POS CORE)
========================= */
CREATE TABLE IF NOT EXISTS Orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  orderNumber TEXT NOT NULL,
  subtotal REAL NOT NULL,
  taxAmount REAL NOT NULL,
  total REAL NOT NULL,
  discountType TEXT NOT NULL,
  discountValue REAL DEFAULT 0.0,
  serviceCharge REAL NOT NULL,
  gstPercent REAL NOT NULL,
  openedAt TEXT NOT NULL,
  closedAt TEXT,
  restaurantId TEXT,
  tableId TEXT,
  userId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  is_synced INTEGER DEFAULT 0,
  sync_error TEXT,

  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id),
  FOREIGN KEY (tableId) REFERENCES Tables(id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);

/* =========================
   Order Items
========================= */
CREATE TABLE IF NOT EXISTS OrderItems (
  menuItemId TEXT NOT NULL,
  orderId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  originalQuantity INTEGER,
  quantityPrinted INTEGER DEFAULT 0,
  quantityServed INTEGER DEFAULT 0,
  quantityCancelled INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  is_synced INTEGER DEFAULT 0,
  sync_error TEXT,

  PRIMARY KEY (menuItemId, orderId),
  FOREIGN KEY (menuItemId) REFERENCES MenuItems(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
);

/* =========================
   Payments
========================= */
CREATE TABLE IF NOT EXISTS Payments (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  paymentMode TEXT NOT NULL,
  transactionId TEXT,
  orderId TEXT,
  restaurantId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  is_synced INTEGER DEFAULT 0,
  sync_error TEXT,

  FOREIGN KEY (orderId) REFERENCES Orders(id),
  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id)
);

/* =========================
   Subscriptions
========================= */
CREATE TABLE IF NOT EXISTS Subscriptions (
  id TEXT PRIMARY KEY,
  planName TEXT NOT NULL,
  amount REAL DEFAULT 0,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  isActive INTEGER DEFAULT 1,
  restaurantId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,

  FOREIGN KEY (restaurantId) REFERENCES Restaurants(id)
);
