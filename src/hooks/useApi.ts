// hooks/useApi.ts
import { useAuth } from "./useAuth";

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error("Unauthorized. Please login again.");
    }

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "API Error");
    }

    return res.json();
  };

  return { apiCall };
};
