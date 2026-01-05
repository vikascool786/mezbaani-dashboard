// hooks/useAuth.ts
import { useState, useCallback, useEffect } from "react";
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
  const [authReady, setAuthReady] = useState(false);

  const isElectron = () =>
    typeof window !== "undefined" && !!(window as any).posAPI;

  // 🔵 WEB ONLY persistence
  const [token, setToken] = useState<string | null | undefined>(() =>
    isElectron() ? undefined : localStorage.getItem("authToken")
  );


  const [user, setUser] = useState<User | null>(() => {
    if (isElectron()) return null;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const baseUrl = process.env.REACT_APP_BASE_URL;

  const redirectByRole = (role: User["role"]) => {
    switch (role) {
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
  };

  const login = useCallback(
    async (phone: string, password: string) => {
      try {
        /* ============================
           ELECTRON LOGIN
        ============================ */
        if (isElectron()) {
          const data = await (window as any).posAPI.login({
            phone,
            password,
          });

          setUser(data.user);
          setToken(data.token); // dummy flag
          redirectByRole(data?.user?.roleName);
          return;
        }

        /* ============================
           WEB LOGIN
        ============================ */
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

        redirectByRole(data.user.role);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    if (isElectron()) {
      await (window as any).posAPI.logout();
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }

    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const bootstrapElectronAuth = async () => {
      if (!window.posAPI) {
        setAuthReady(true); // web
        return;
      }

      const session = await window.posAPI.getAuthSession();

      if (session) {
        setToken(session.token);
        setUser({
          id: session.userId,
          phone: session.phone,
          email: session.email,
          role: session.roleName,
          restaurantId: session.restaurantId,
        });
      } else {
        setToken(null); // ✅ EXPLICIT logout state
        setUser(null);
      }

      setAuthReady(true); // ✅ IMPORTANT
    };

    bootstrapElectronAuth();
  }, []);

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    authReady,
  };

};
