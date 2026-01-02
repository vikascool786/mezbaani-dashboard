import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState("8888888881");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || !password) {
      setError("Enter phone and password");
      return;
    }

    try {
      setLoading(true);
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left d-none d-md-flex flex-column justify-content-center align-items-center text-white">
        <img src="/logo192.png" alt="Company Logo" className="login-logo mb-3" />
        <h2 className="fw-bold">Mezbaani POS</h2>
        <p className="text-light text-center px-4">
          Manage your restaurant with ease and efficiency.
        </p>
      </div>
      <div className="login-right d-flex justify-content-center align-items-center">
        <Card className="p-4 shadow login-card">
          <h4 className="text-center mb-4">Login</h4>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </Form.Group>
            {error && <div className="text-danger mb-3">{error}</div>}
            <Button type="submit" variant="danger" className="w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
