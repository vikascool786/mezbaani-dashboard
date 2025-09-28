import React from "react";
import {
  Navbar as BsNavbar,
  Nav,
  Button,
  Form,
  FormControl,
} from "react-bootstrap";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <BsNavbar bg="light" expand="lg" className="px-0 shadow-sm py-0 ps-3 sticky-top">
      {/* Hamburger button */}
      <div
        style={{ cursor: "pointer" }}
        className="me-3 d-flex align-items-center pointer"
        onClick={onToggleSidebar}
      >
        <i className="bi bi-list fs-4"></i>
      </div>

      <BsNavbar.Brand href="#">
        <i className="bi bi-fork-knife"></i> POS
      </BsNavbar.Brand>

      <div className="d-flex align-items-center gap-2 ms-3">
        <Button variant="danger">New Order</Button>
        <Form className="d-flex">
          <FormControl type="search" placeholder="Bill No" className="me-2" />
        </Form>
      </div>

      <Nav className="align-items-center d-flex gap-3 ms-auto navbar-nav mz-menu__wrapper">
        <div className="align-items-center d-flex fw-bold gap-2 mz-menu__links pe-4">
          <div className="align-items-center d-flex flex-column justify-content-start mz-support__links">
            <i className="bi bi-shop"></i>
            <span className="mz-menu_link-item"><a href="#">Store Status</a></span>
          </div>
        </div>
        <div className="align-items-center d-flex fw-bold gap-2 mz-menu__links pe-4">
          <div className="align-items-center d-flex flex-column justify-content-start mz-support__links">
            <i className="bi bi-bell"></i>
            <span className="mz-menu_link-item"><a href="#">Notifications</a></span>
          </div>
        </div>
      </Nav>
      <Nav className="align-items-center d-flex gap-3 mz-support__nav navbar-nav">
        <div className="align-items-center d-flex fw-bold gap-2 mz-support__wrapper text-danger">
          <i className="bi bi-headset"></i>
          <div className="align-items-center d-flex flex-column justify-content-start mz-support__links">
            <span className="mz-call__text">Call for Support</span>
            <span className="mz-call__phone">
              <a href="tel:9765924481">9765924481</a>
            </span>
          </div>
        </div>
      </Nav>
    </BsNavbar>
  );
};
