import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { HashRouter } from "react-router-dom";
import "./style.css";
import { Navbar } from "./components/Navbar";
import { TableView } from "./components/TableView";
import Sidebar from "./components/sidebar/Sidebar";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import ManageMenus from "./pages/ManageMenus";

// toastyfy styles
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <HashRouter>
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
          <Route path="tables" element={<Tables />} />
          <Route path="menu">
            <Route path="categories" element={<ManageMenus type="categories" />} />
            <Route path="items" element={<ManageMenus type="items" />} />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} />
    </HashRouter>
  );
}
