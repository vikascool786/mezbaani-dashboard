import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./style.css";
import { Navbar } from "./components/Navbar";
import { TableView } from "./components/TableView";
import Sidebar from "./components/sidebar/Sidebar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Orders from "./pages/Orders";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="d-flex">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className="flex-grow-1"
        style={{ marginLeft: isSidebarOpen ? 240 : 0, transition: "margin-left 0.3s ease-in-out" }}
      >
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="container-fluid mt-3 px-3">
          {/* all child pages (TableView, Orders, etc.) will render here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* protected layout route: renders Sidebar + Navbar and an Outlet */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* index -> dashboard main content */}
          <Route index element={<TableView />} />
          {/* /orders -> Orders page inside the same layout */}
          <Route path="orders" element={<Orders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
