import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card } from "react-bootstrap";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      localStorage.setItem("authToken", "dummy-token");
      navigate("/", { replace: true });
    } else {
      alert("Enter username and password");
    }
  };

  return (
    <div className="login-container">
      {/* Left branding panel */}
      <div className="login-left d-none d-md-flex flex-column justify-content-center align-items-center text-white">
        <img src="/logo192.png" alt="Company Logo" className="login-logo mb-3" />
        <h2 className="fw-bold">Mezbaani POS</h2>
        <p className="text-light text-center px-4">
          Manage your restaurant with ease and efficiency.
        </p>
      </div>

      {/* Right login form */}
      <div className="login-right d-flex justify-content-center align-items-center">
        <Card className="p-4 shadow login-card">
          <h4 className="text-center mb-4">Admin Login</h4>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </Form.Group>
            <Button type="submit" variant="danger" className="w-100">
              Login
            </Button>
          </Form>
          <div className="text-center mt-3 small text-muted">
            © {new Date().getFullYear()} Mezbaani. All rights reserved.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
