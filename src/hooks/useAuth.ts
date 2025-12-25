// hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  role: "admin" | "captain" | "waiter";
  phone: string;
  email?: string;
  restaurantId?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
    
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const login = useCallback(async (phone: string, password: string) => {
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data: AuthResponse = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;
        case "captain":
          navigate("/captain", { replace: true });
          break;
        case "waiter":
          navigate("/waiter", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  return { token, user, login, logout, isAuthenticated: !!token };
};
