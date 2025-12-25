// src/components/Sidebar.tsx
import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // adjust path if needed
import "./style.css";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { logout } = useAuth(); // use logout from auth hook
  const [openMenus, setOpenMenus] = React.useState(false);


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
        <Nav.Item>
          <div
            className="d-flex align-items-center sidebar-link"
            style={{ cursor: "pointer" }}
            onClick={() => setOpenMenus(prev => !prev)}
          >
            <i className="bi bi-menu-button me-2"></i>
            <span className="link-text">Manage Menus</span>
            <i
              className={`bi ms-auto ${openMenus ? "bi-chevron-up" : "bi-chevron-down"
                }`}
            />
          </div>

          {openMenus && (
            <div className="submenu ps-4 mt-1">
              <Nav.Link
                as={NavLink}
                to="/menu/categories"
                className="sidebar-sublink"
              >
                <i className="bi bi-tags me-2"></i>
                Menu Categories
              </Nav.Link>

              <Nav.Link
                as={NavLink}
                to="/menu/items"
                className="sidebar-sublink"
              >
                <i className="bi bi-list-ul me-2"></i>
                Menu Items
              </Nav.Link>
            </div>
          )}
        </Nav.Item>

        <Nav.Link as={NavLink} to="/staff" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-people me-2"></i>
          <span className="link-text">Staff</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/tables" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-basket me-2"></i>
          <span className="link-text">Tables</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/reservations" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-calendar2-check me-2"></i>
          <span className="link-text">Reservations</span>
        </Nav.Link>

        <Nav.Link href="#" className="d-flex align-items-center sidebar-link">
          <i className="bi bi-gear me-2"></i>
          <span className="link-text">Settings</span>
        </Nav.Link>

        {/* Logout button */}
        <Nav.Link
          href="#"
          onClick={logout}
          className="align-items-center d-flex fixed-bottom fs-6 mt-3 nav-link sidebar-link"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          <span className="link-text">Logout</span>
        </Nav.Link>
      </Nav>
    </aside>
  );
};

export default Sidebar;
