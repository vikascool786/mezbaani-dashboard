// src/components/Sidebar.tsx
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./style.css"; // adjust path if your css file is elsewhere


interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`} aria-label="Sidebar">
      <div className="sidebar-header mb-3 d-flex align-items-center justify-content-between">
        <div className="align-items-center d-flex mb-0 pb-0 ps-2 pt-3">
          <i className="bi bi-fork-knife fs-4 me-2"></i>
          <span className="sidebar-brand-text">Mezbaani</span>
        </div>
      </div>

      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-house-door me-2"></i>
          <span className="link-text">Dashboard</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/orders" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-basket me-2"></i>
          <span className="link-text">Orders</span>
        </Nav.Link>

        <Nav.Link href="#" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-table me-2"></i>
          <span className="link-text">Tables</span>
        </Nav.Link>

        <Nav.Link href="#" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-calendar2-check me-2"></i>
          <span className="link-text">Reservations</span>
        </Nav.Link>

        <Nav.Link href="#" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-gear me-2"></i>
          <span className="link-text">Settings</span>
        </Nav.Link>
      </Nav>
    </aside>
  );
};

export default Sidebar;
